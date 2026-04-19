from django.urls import path
from . import admin_views

urlpatterns = [
    path('stats/', admin_views.AdminStatsView.as_view()),
    path('bookings/', admin_views.AdminBookingsView.as_view()),
    path('users/', admin_views.AdminUsersView.as_view()),
    path('trips/', admin_views.AdminTripsView.as_view()),
    path('recent-bookings/', admin_views.AdminRecentBookingsView.as_view()),
]