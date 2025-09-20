import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Resume


class ResumeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.resume_id = self.scope['url_route']['kwargs']['resume_id']
        self.room_group_name = f'resume_{self.resume_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial resume data
        resume_data = await self.get_resume_data()
        if resume_data:
            await self.send(text_data=json.dumps({
                'type': 'resume_data',
                'data': resume_data
            }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
            elif message_type == 'get_resume':
                resume_data = await self.get_resume_data()
                if resume_data:
                    await self.send(text_data=json.dumps({
                        'type': 'resume_data',
                        'data': resume_data
                    }))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))

    # Receive message from room group
    async def resume_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'resume_update',
            'data': event['data']
        }))

    async def resume_created(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'resume_created',
            'data': event['data']
        }))

    async def resume_deleted(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'resume_deleted',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_resume_data(self):
        """Get resume data from database"""
        try:
            resume = Resume.objects.get(id=self.resume_id)
            return {
                'id': resume.id,
                'content': resume.content,
                'created_at': resume.created_at.isoformat(),
                'updated_at': resume.updated_at.isoformat(),
            }
        except Resume.DoesNotExist:
            return None
