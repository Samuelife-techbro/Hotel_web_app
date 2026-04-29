from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hotel_app.models import Room, InventoryItem, RoomInventory, Booking, Notification
from decimal import Decimal
from datetime import date, timedelta
import random


ROOMS_DATA = [
    {
        "name": "Ocean View Standard",
        "room_number": "101",
        "category": "standard",
        "description": "A cozy standard room with breathtaking ocean views. Features a comfortable queen bed, modern bathroom, and a small balcony perfect for morning coffee.",
        "price_per_night": "120.00",
        "capacity": 2,
        "floor": 1,
        "size_sqm": 28,
        "amenities": ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Room Service"],
        "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    },
    {
        "name": "Garden Deluxe Room",
        "room_number": "201",
        "category": "deluxe",
        "description": "Spacious deluxe room overlooking our lush tropical gardens. Features a king bed, sitting area, luxury bathroom with soaking tub, and premium amenities.",
        "price_per_night": "200.00",
        "capacity": 2,
        "floor": 2,
        "size_sqm": 42,
        "amenities": ["WiFi", "Smart TV", "Air Conditioning", "Mini Bar", "Soaking Tub", "Balcony", "Room Service", "Coffee Machine"],
        "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    },
    {
        "name": "Penthouse Suite",
        "room_number": "501",
        "category": "suite",
        "description": "Our crown jewel. A stunning penthouse suite with panoramic city views, separate living room, gourmet kitchen, private jacuzzi, and personalized butler service.",
        "price_per_night": "550.00",
        "capacity": 4,
        "floor": 5,
        "size_sqm": 120,
        "amenities": ["WiFi", "Smart TV", "Air Conditioning", "Full Kitchen", "Jacuzzi", "Butler Service", "Private Terrace", "Dining Area", "Walk-in Closet"],
        "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    },
    {
        "name": "Family Suite",
        "room_number": "302",
        "category": "suite",
        "description": "Designed for families, this suite features two bedrooms, a spacious living area, two bathrooms, and all the comforts of home with hotel luxury.",
        "price_per_night": "380.00",
        "capacity": 5,
        "floor": 3,
        "size_sqm": 90,
        "amenities": ["WiFi", "TV", "Air Conditioning", "Mini Kitchen", "2 Bathrooms", "Living Room", "Children Amenities"],
        "image_url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    },
    {
        "name": "Executive King Room",
        "room_number": "401",
        "category": "deluxe",
        "description": "Tailored for business travelers. Features a king bed, dedicated workspace, high-speed WiFi, espresso machine, and access to the Executive Lounge.",
        "price_per_night": "260.00",
        "capacity": 2,
        "floor": 4,
        "size_sqm": 50,
        "amenities": ["WiFi", "Smart TV", "Air Conditioning", "Workspace", "Espresso Machine", "Executive Lounge Access", "Evening Turndown"],
        "image_url": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    },
    {
        "name": "Classic Twin Room",
        "room_number": "102",
        "category": "standard",
        "description": "Classic twin room with two single beds, ideal for friends or colleagues traveling together. Clean, comfortable, and well-equipped.",
        "price_per_night": "110.00",
        "capacity": 2,
        "floor": 1,
        "size_sqm": 26,
        "amenities": ["WiFi", "TV", "Air Conditioning", "Wardrobe", "Room Service"],
        "image_url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
    },
    {
        "name": "Presidential Suite",
        "room_number": "601",
        "category": "presidential",
        "description": "The ultimate in luxury. Our Presidential Suite spans the entire top floor with 360-degree views, a private pool, home theater, gourmet kitchen, and dedicated staff.",
        "price_per_night": "1500.00",
        "capacity": 6,
        "floor": 6,
        "size_sqm": 300,
        "amenities": ["WiFi", "Home Theater", "Private Pool", "Full Kitchen", "Private Staff", "Gym", "Wine Cellar", "Multiple Bedrooms", "Conference Room"],
        "image_url": "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&q=80",
    },
    {
        "name": "Cozy Standard Room",
        "room_number": "103",
        "category": "standard",
        "description": "A warm and inviting standard room perfect for solo travelers or short stays. Efficient layout with everything you need for a comfortable visit.",
        "price_per_night": "95.00",
        "capacity": 1,
        "floor": 1,
        "size_sqm": 22,
        "amenities": ["WiFi", "TV", "Air Conditioning", "Desk", "Room Service"],
        "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
    },
]

INVENTORY_DATA = [
    {"name": "Bath Towels", "unit": "piece", "total_stock": 500, "min_stock_alert": 50},
    {"name": "Hand Towels", "unit": "piece", "total_stock": 400, "min_stock_alert": 40},
    {"name": "Bed Sheets (King)", "unit": "set", "total_stock": 100, "min_stock_alert": 20},
    {"name": "Bed Sheets (Queen)", "unit": "set", "total_stock": 150, "min_stock_alert": 25},
    {"name": "Pillows", "unit": "piece", "total_stock": 300, "min_stock_alert": 30},
    {"name": "Shampoo Bottles", "unit": "bottle", "total_stock": 1000, "min_stock_alert": 100},
    {"name": "Soap Bars", "unit": "piece", "total_stock": 1200, "min_stock_alert": 120},
    {"name": "Coffee Pods", "unit": "pack", "total_stock": 800, "min_stock_alert": 80},
    {"name": "Mini Bar Snacks", "unit": "pack", "total_stock": 600, "min_stock_alert": 60},
    {"name": "Water Bottles", "unit": "bottle", "total_stock": 2000, "min_stock_alert": 200},
]


class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@hotel.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Admin user created: admin / admin123'))

        # Create rooms
        for room_data in ROOMS_DATA:
            room, created = Room.objects.get_or_create(
                room_number=room_data['room_number'],
                defaults=room_data
            )
            if created:
                self.stdout.write(f'  Created room {room.room_number}')

        # Create inventory items
        items = []
        for item_data in INVENTORY_DATA:
            item, created = InventoryItem.objects.get_or_create(
                name=item_data['name'],
                defaults=item_data
            )
            items.append(item)
            if created:
                self.stdout.write(f'  Created inventory item: {item.name}')

        # Link inventory to rooms
        rooms = list(Room.objects.all())
        for room in rooms:
            for item in items[:5]:  # assign first 5 items to each room
                RoomInventory.objects.get_or_create(
                    room=room,
                    item=item,
                    defaults={'quantity_used': random.randint(1, 10)}
                )

        # Create sample bookings
        guest_names = [
            ("Alice Johnson", "alice@example.com", "+1-555-0101"),
            ("Bob Smith", "bob@example.com", "+1-555-0102"),
            ("Carol White", "carol@example.com", "+1-555-0103"),
            ("David Brown", "david@example.com", "+1-555-0104"),
            ("Eve Davis", "eve@example.com", "+1-555-0105"),
        ]

        today = date.today()
        statuses = ['confirmed', 'confirmed', 'pending', 'checked_in', 'checked_out']

        for i, (name, email, phone) in enumerate(guest_names):
            room = rooms[i % len(rooms)]
            check_in = today + timedelta(days=i * 3 - 5)
            check_out = check_in + timedelta(days=random.randint(1, 4))

            if not Booking.objects.filter(guest_email=email).exists():
                booking = Booking.objects.create(
                    room=room,
                    guest_name=name,
                    guest_email=email,
                    guest_phone=phone,
                    check_in=check_in,
                    check_out=check_out,
                    status=statuses[i],
                    num_guests=random.randint(1, 2),
                )
                self.stdout.write(f'  Created booking {booking.booking_reference}')

                Notification.objects.get_or_create(
                    title=f"New Booking: {booking.booking_reference}",
                    defaults={
                        "message": f"{booking.guest_name} booked Room {booking.room.room_number}",
                        "notification_type": "new_booking",
                        "related_booking": booking,
                    }
                )

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('   Admin login: admin / admin123'))
