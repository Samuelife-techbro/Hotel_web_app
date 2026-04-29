from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Room, Booking, InventoryItem, RoomInventory, Notification
from decimal import Decimal


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']


class RoomInventorySerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_unit = serializers.CharField(source='item.unit', read_only=True)

    class Meta:
        model = RoomInventory
        fields = ['id', 'room', 'item', 'item_name', 'item_unit', 'quantity_used', 'last_restocked']


class RoomSerializer(serializers.ModelSerializer):
    display_image = serializers.ReadOnlyField()
    inventory_items = RoomInventorySerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'room_number', 'category', 'description',
            'price_per_night', 'capacity', 'floor', 'is_available',
            'amenities', 'image', 'image_url', 'display_image',
            'size_sqm', 'inventory_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class RoomListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    display_image = serializers.ReadOnlyField()

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'room_number', 'category', 'description',
            'price_per_night', 'capacity', 'floor', 'is_available',
            'amenities', 'display_image', 'size_sqm'
        ]


class BookingSerializer(serializers.ModelSerializer):
    room_details = RoomListSerializer(source='room', read_only=True)
    duration_nights = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = [
            'id', 'room', 'room_details', 'guest_name', 'guest_email',
            'guest_phone', 'check_in', 'check_out', 'num_guests', 'status',
            'special_requests', 'total_price', 'booking_reference',
            'duration_nights', 'created_at', 'updated_at'
        ]
        read_only_fields = ['booking_reference', 'total_price', 'created_at', 'updated_at']

    def validate(self, data):
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        room = data.get('room')

        if check_in and check_out:
            if check_out <= check_in:
                raise serializers.ValidationError("Check-out must be after check-in.")

            # Check for overlapping bookings
            overlapping = Booking.objects.filter(
                room=room,
                status__in=['pending', 'confirmed', 'checked_in'],
                check_in__lt=check_out,
                check_out__gt=check_in,
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError(
                    "Room is not available for the selected dates."
                )

        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'room', 'guest_name', 'guest_email', 'guest_phone',
            'check_in', 'check_out', 'num_guests', 'special_requests'
        ]

    def validate(self, data):
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        room = data.get('room')

        if check_out <= check_in:
            raise serializers.ValidationError({"check_out": "Check-out must be after check-in."})

        from datetime import date
        if check_in < date.today():
            raise serializers.ValidationError({"check_in": "Check-in cannot be in the past."})

        overlapping = Booking.objects.filter(
            room=room,
            status__in=['pending', 'confirmed', 'checked_in'],
            check_in__lt=check_out,
            check_out__gt=check_in,
        )
        if overlapping.exists():
            raise serializers.ValidationError(
                {"room": "Room is not available for the selected dates."}
            )

        return data


class InventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()
    total_used = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'name', 'description', 'unit', 'total_stock',
            'min_stock_alert', 'is_low_stock', 'total_used',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_total_used(self, obj):
        return sum(ri.quantity_used for ri in obj.room_inventory.all())


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read',
                  'related_booking', 'created_at']
        read_only_fields = ['created_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    available_rooms = serializers.IntegerField()
    total_rooms = serializers.IntegerField()
    occupancy_rate = serializers.FloatField()
    pending_bookings = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    recent_bookings = BookingSerializer(many=True)
