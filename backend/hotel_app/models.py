from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal


class RoomCategory(models.TextChoices):
    STANDARD = 'standard', 'Standard'
    DELUXE = 'deluxe', 'Deluxe'
    SUITE = 'suite', 'Suite'
    PRESIDENTIAL = 'presidential', 'Presidential'


class BookingStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    CHECKED_IN = 'checked_in', 'Checked In'
    CHECKED_OUT = 'checked_out', 'Checked Out'
    CANCELLED = 'cancelled', 'Cancelled'


class Room(models.Model):
    name = models.CharField(max_length=100)
    room_number = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=20, choices=RoomCategory.choices, default=RoomCategory.STANDARD)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    capacity = models.PositiveIntegerField(default=2)
    floor = models.PositiveIntegerField(default=1)
    is_available = models.BooleanField(default=True)
    amenities = models.JSONField(default=list, blank=True)
    image = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image_url = models.URLField(blank=True, null=True)  # fallback external URL
    size_sqm = models.PositiveIntegerField(default=25)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['room_number']

    def __str__(self):
        return f"Room {self.room_number} - {self.name}"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url or ''


class InventoryItem(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=30, default='piece')
    total_stock = models.PositiveIntegerField(default=0)
    min_stock_alert = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        used = sum(ri.quantity_used for ri in self.room_inventory.all())
        available = self.total_stock - used
        return available <= self.min_stock_alert


class RoomInventory(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='inventory_items')
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='room_inventory')
    quantity_used = models.PositiveIntegerField(default=0)
    last_restocked = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['room', 'item']

    def __str__(self):
        return f"{self.room} - {self.item}: {self.quantity_used}"


class Booking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.PROTECT, related_name='bookings')
    guest_name = models.CharField(max_length=150)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=20, blank=True)
    check_in = models.DateField()
    check_out = models.DateField()
    num_guests = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING)
    special_requests = models.TextField(blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    booking_reference = models.CharField(max_length=20, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.booking_reference} - {self.guest_name}"

    @property
    def duration_nights(self):
        return (self.check_out - self.check_in).days

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            import random, string
            self.booking_reference = 'HB' + ''.join(random.choices(string.digits, k=8))
        if not self.total_price or self.total_price == Decimal('0.00'):
            nights = self.duration_nights
            self.total_price = self.room.price_per_night * nights
        super().save(*args, **kwargs)


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_BOOKING = 'new_booking', 'New Booking'
        BOOKING_CANCELLED = 'booking_cancelled', 'Booking Cancelled'
        LOW_STOCK = 'low_stock', 'Low Stock Alert'
        SYSTEM = 'system', 'System'

    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    related_booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
