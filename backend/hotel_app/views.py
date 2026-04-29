from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.http import HttpResponse
from datetime import datetime, date, timedelta
from decimal import Decimal
import csv

from .models import Room, Booking, InventoryItem, RoomInventory, Notification, BookingStatus
from .serializers import (
    RoomSerializer, RoomListSerializer, BookingSerializer, BookingCreateSerializer,
    InventoryItemSerializer, RoomInventorySerializer, NotificationSerializer,
    UserSerializer
)
from .filters import RoomFilter, BookingFilter
from .tasks import send_booking_notification


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RoomFilter
    search_fields = ['name', 'room_number', 'description', 'category']
    ordering_fields = ['price_per_night', 'capacity', 'floor', 'room_number']
    ordering = ['room_number']

    def get_serializer_class(self):
        if self.action == 'list':
            return RoomListSerializer
        return RoomSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def availability(self, request, pk=None):
        room = self.get_object()
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')

        if not check_in or not check_out:
            return Response({'error': 'check_in and check_out required'}, status=400)

        try:
            ci = datetime.strptime(check_in, '%Y-%m-%d').date()
            co = datetime.strptime(check_out, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=400)

        overlapping = Booking.objects.filter(
            room=room,
            status__in=['pending', 'confirmed', 'checked_in'],
            check_in__lt=co,
            check_out__gt=ci,
        ).exists()

        return Response({'available': not overlapping and room.is_available})

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def available_rooms(self, request):
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')

        rooms = Room.objects.filter(is_available=True)

        if check_in and check_out:
            try:
                ci = datetime.strptime(check_in, '%Y-%m-%d').date()
                co = datetime.strptime(check_out, '%Y-%m-%d').date()
                booked_room_ids = Booking.objects.filter(
                    status__in=['pending', 'confirmed', 'checked_in'],
                    check_in__lt=co,
                    check_out__gt=ci,
                ).values_list('room_id', flat=True)
                rooms = rooms.exclude(id__in=booked_room_ids)
            except ValueError:
                pass

        serializer = RoomListSerializer(rooms, many=True, context={'request': request})
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('room').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BookingFilter
    search_fields = ['guest_name', 'guest_email', 'booking_reference', 'room__room_number']
    ordering_fields = ['created_at', 'check_in', 'total_price']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

        # Create notification
        Notification.objects.create(
            title=f"New Booking: {booking.booking_reference}",
            message=f"{booking.guest_name} booked Room {booking.room.room_number} "
                    f"({booking.check_in} to {booking.check_out}). "
                    f"Total: ${booking.total_price}",
            notification_type=Notification.NotificationType.NEW_BOOKING,
            related_booking=booking
        )

        # Broadcast via WebSocket
        try:
            send_booking_notification(booking)
        except Exception:
            pass

        return Response(
            BookingSerializer(booking, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(BookingStatus.choices):
            return Response({'error': 'Invalid status'}, status=400)
        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking, context={'request': request}).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def export_csv(self, request):
        date_filter = request.query_params.get('filter', 'all')
        bookings = self._filter_by_period(Booking.objects.all(), date_filter)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="bookings_{date_filter}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Reference', 'Guest Name', 'Guest Email', 'Guest Phone',
            'Room Number', 'Room Category', 'Check In', 'Check Out',
            'Nights', 'Guests', 'Status', 'Total Price', 'Created At'
        ])

        for booking in bookings:
            writer.writerow([
                booking.booking_reference,
                booking.guest_name,
                booking.guest_email,
                booking.guest_phone,
                booking.room.room_number,
                booking.room.category,
                booking.check_in,
                booking.check_out,
                booking.duration_nights,
                booking.num_guests,
                booking.status,
                booking.total_price,
                booking.created_at.strftime('%Y-%m-%d %H:%M'),
            ])

        return response

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request):
        date_filter = request.query_params.get('filter', 'monthly')
        bookings = self._filter_by_period(Booking.objects.all(), date_filter)

        by_status = bookings.values('status').annotate(count=Count('id'))
        by_room_type = bookings.values('room__category').annotate(
            count=Count('id'), revenue=Sum('total_price')
        )

        revenue_data = []
        today = date.today()
        if date_filter == 'daily':
            for i in range(7):
                day = today - timedelta(days=6 - i)
                rev = Booking.objects.filter(
                    created_at__date=day,
                    status__in=['confirmed', 'checked_in', 'checked_out']
                ).aggregate(total=Sum('total_price'))['total'] or 0
                revenue_data.append({'date': day.isoformat(), 'revenue': float(rev)})
        elif date_filter == 'weekly':
            for i in range(4):
                week_start = today - timedelta(weeks=3 - i)
                week_end = week_start + timedelta(days=6)
                rev = Booking.objects.filter(
                    created_at__date__gte=week_start,
                    created_at__date__lte=week_end,
                    status__in=['confirmed', 'checked_in', 'checked_out']
                ).aggregate(total=Sum('total_price'))['total'] or 0
                revenue_data.append({
                    'date': f"Week {i + 1}",
                    'revenue': float(rev)
                })
        else:  # monthly
            for i in range(6):
                month_date = today.replace(day=1) - timedelta(days=i * 30)
                rev = Booking.objects.filter(
                    created_at__year=month_date.year,
                    created_at__month=month_date.month,
                    status__in=['confirmed', 'checked_in', 'checked_out']
                ).aggregate(total=Sum('total_price'))['total'] or 0
                revenue_data.append({
                    'date': month_date.strftime('%b %Y'),
                    'revenue': float(rev)
                })
            revenue_data.reverse()

        return Response({
            'by_status': list(by_status),
            'by_room_type': list(by_room_type),
            'revenue_trend': revenue_data,
        })

    def _filter_by_period(self, queryset, period):
        today = date.today()
        if period == 'daily':
            return queryset.filter(created_at__date=today)
        elif period == 'weekly':
            week_start = today - timedelta(days=today.weekday())
            return queryset.filter(created_at__date__gte=week_start)
        elif period == 'monthly':
            return queryset.filter(
                created_at__year=today.year,
                created_at__month=today.month
            )
        return queryset


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'total_stock']

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        items = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="inventory.csv"'

        writer = csv.writer(response)
        writer.writerow(['Item Name', 'Description', 'Unit', 'Total Stock', 'Total Used', 'Available', 'Low Stock Alert'])

        for item in items:
            total_used = sum(ri.quantity_used for ri in item.room_inventory.all())
            writer.writerow([
                item.name,
                item.description,
                item.unit,
                item.total_stock,
                total_used,
                item.total_stock - total_used,
                item.min_stock_alert,
            ])

        return response


class RoomInventoryViewSet(viewsets.ModelViewSet):
    queryset = RoomInventory.objects.select_related('room', 'item').all()
    serializer_class = RoomInventorySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room', 'item']


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'All notifications marked as read'})

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(is_read=False).count()
        return Response({'count': count})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = date.today()
    month_start = today.replace(day=1)

    total_rooms = Room.objects.count()
    available_rooms = Room.objects.filter(is_available=True).count()
    active_bookings = Booking.objects.filter(
        status__in=['confirmed', 'checked_in']
    ).count()
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()

    total_revenue = Booking.objects.filter(
        status__in=['confirmed', 'checked_in', 'checked_out']
    ).aggregate(total=Sum('total_price'))['total'] or Decimal('0')

    monthly_revenue = Booking.objects.filter(
        status__in=['confirmed', 'checked_in', 'checked_out'],
        created_at__date__gte=month_start
    ).aggregate(total=Sum('total_price'))['total'] or Decimal('0')

    occupied_now = Booking.objects.filter(
        status='checked_in',
        check_in__lte=today,
        check_out__gte=today
    ).count()
    occupancy_rate = (occupied_now / total_rooms * 100) if total_rooms > 0 else 0

    unread_notifications = Notification.objects.filter(is_read=False).count()
    recent_bookings = Booking.objects.select_related('room').order_by('-created_at')[:5]

    return Response({
        'total_bookings': total_bookings,
        'active_bookings': active_bookings,
        'total_revenue': float(total_revenue),
        'monthly_revenue': float(monthly_revenue),
        'available_rooms': available_rooms,
        'total_rooms': total_rooms,
        'occupancy_rate': round(occupancy_rate, 1),
        'pending_bookings': pending_bookings,
        'unread_notifications': unread_notifications,
        'recent_bookings': BookingSerializer(recent_bookings, many=True, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)
