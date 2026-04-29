from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RoomViewSet, BookingViewSet, InventoryItemViewSet,
    RoomInventoryViewSet, NotificationViewSet,
    dashboard_stats, me
)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'inventory/items', InventoryItemViewSet)
router.register(r'inventory/room-items', RoomInventoryViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', me, name='me'),
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
]
