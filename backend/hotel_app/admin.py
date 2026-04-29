from django.contrib import admin
from .models import Room, Booking, InventoryItem, RoomInventory, Notification


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'name', 'category', 'price_per_night', 'is_available', 'capacity']
    list_filter = ['category', 'is_available', 'floor']
    search_fields = ['room_number', 'name']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_reference', 'guest_name', 'room', 'check_in', 'check_out', 'status', 'total_price']
    list_filter = ['status', 'check_in']
    search_fields = ['booking_reference', 'guest_name', 'guest_email']


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'unit', 'total_stock', 'min_stock_alert']


@admin.register(RoomInventory)
class RoomInventoryAdmin(admin.ModelAdmin):
    list_display = ['room', 'item', 'quantity_used']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['is_read', 'notification_type']
