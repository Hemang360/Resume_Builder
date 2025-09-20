from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/resume/<str:resume_id>/', consumers.ResumeConsumer.as_asgi()),
]
