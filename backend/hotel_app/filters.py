import django_filters
from .models import Room, Booking
from django.db.models import Q


class RoomFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price_per_night', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price_per_night', lookup_expr='lte')
    min_capacity = django_filters.NumberFilter(field_name='capacity', lookup_expr='gte')
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    is_available = django_filters.BooleanFilter(field_name='is_available')
    floor = django_filters.NumberFilter(field_name='floor')

    class Meta:
        model = Room
        fields = ['category', 'is_available', 'floor', 'capacity']


class BookingFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name='status')
    check_in_from = django_filters.DateFilter(field_name='check_in', lookup_expr='gte')
    check_in_to = django_filters.DateFilter(field_name='check_in', lookup_expr='lte')
    created_from = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    room = django_filters.NumberFilter(field_name='room__id')

    class Meta:
        model = Booking
        fields = ['status', 'room']
