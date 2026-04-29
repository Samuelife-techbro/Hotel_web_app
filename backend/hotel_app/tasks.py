from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def send_booking_notification(booking):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "admin_notifications",
        {
            "type": "booking_notification",
            "data": {
                "id": booking.id,
                "reference": booking.booking_reference,
                "guest_name": booking.guest_name,
                "room_number": booking.room.room_number,
                "check_in": str(booking.check_in),
                "check_out": str(booking.check_out),
                "total_price": str(booking.total_price),
                "created_at": booking.created_at.isoformat(),
            }
        }
    )
