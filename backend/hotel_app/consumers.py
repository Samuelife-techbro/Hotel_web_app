import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "admin_notifications"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # We only send from server to client

    async def booking_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'booking_notification',
            'data': event['data'],
        }))

    async def system_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'system_notification',
            'data': event['data'],
        }))
