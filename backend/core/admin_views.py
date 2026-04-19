from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from buses.models import Bus, Route, Trip, BusOperator
from bookings.models import Booking
from buses.serializers import TripSerializer
from bookings.serializers import BookingSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)

        total_bookings = Booking.objects.count()
        recent_bookings = Booking.objects.filter(booked_at__gte=last_7_days).count()
        confirmed_bookings = Booking.objects.filter(status='confirmed').count()
        cancelled_bookings = Booking.objects.filter(status='cancelled').count()

        total_revenue = Booking.objects.filter(
            status='confirmed', payment_status='paid'
        ).aggregate(total=Sum('total_fare'))['total'] or 0

        recent_revenue = Booking.objects.filter(
            status='confirmed', payment_status='paid',
            booked_at__gte=last_30_days
        ).aggregate(total=Sum('total_fare'))['total'] or 0

        total_users = User.objects.filter(role='passenger').count()
        new_users = User.objects.filter(date_joined__gte=last_7_days).count()
        total_routes = Route.objects.count()
        total_buses = Bus.objects.count()
        active_trips = Trip.objects.filter(status='scheduled').count()

        return Response({
            'bookings': {
                'total': total_bookings,
                'recent_7_days': recent_bookings,
                'confirmed': confirmed_bookings,
                'cancelled': cancelled_bookings,
            },
            'revenue': {
                'total': float(total_revenue),
                'last_30_days': float(recent_revenue),
            },
            'users': {
                'total': total_users,
                'new_7_days': new_users,
            },
            'operations': {
                'total_routes': total_routes,
                'total_buses': total_buses,
                'active_trips': active_trips,
            }
        })


class AdminBookingsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status', '')
        bookings = Booking.objects.select_related(
            'user', 'trip__route', 'trip__bus__operator'
        ).order_by('-booked_at')

        if status_filter:
            bookings = bookings.filter(status=status_filter)

        bookings = bookings[:50]  # limit to 50

        data = []
        for b in bookings:
            data.append({
                'id': b.id,
                'booking_id': str(b.booking_id)[:8].upper(),
                'user_name': b.user.get_full_name() or b.user.email,
                'user_email': b.user.email,
                'route': f"{b.trip.route.source} → {b.trip.route.destination}",
                'departure': b.trip.departure_time.strftime('%d %b %Y %I:%M %p'),
                'seats': b.passengers.count(),
                'amount': float(b.total_fare),
                'status': b.status,
                'payment_status': b.payment_status,
                'booked_at': b.booked_at.strftime('%d %b %Y'),
            })
        return Response({'count': len(data), 'results': data})


class AdminUsersView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.order_by('-date_joined')[:50]
        data = []
        for u in users:
            data.append({
                'id': u.id,
                'name': u.get_full_name() or 'N/A',
                'email': u.email,
                'phone': u.phone,
                'role': u.role,
                'bookings': Booking.objects.filter(user=u).count(),
                'joined': u.date_joined.strftime('%d %b %Y'),
                'is_active': u.is_active,
            })
        return Response({'count': len(data), 'results': data})


class AdminTripsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        trips = Trip.objects.select_related(
            'bus__operator', 'route'
        ).order_by('departure_time')[:50]

        data = []
        for t in trips:
            data.append({
                'id': t.id,
                'route': f"{t.route.source} → {t.route.destination}",
                'operator': t.bus.operator.name,
                'bus_type': t.bus.bus_type.replace('_', ' ').title(),
                'departure': t.departure_time.strftime('%d %b %Y %I:%M %p'),
                'fare': float(t.fare),
                'available_seats': t.available_seats,
                'total_seats': t.bus.total_seats,
                'status': t.status,
            })
        return Response({'count': len(data), 'results': data})


class AdminRecentBookingsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        bookings = Booking.objects.select_related(
            'user', 'trip__route'
        ).order_by('-booked_at')[:10]

        data = []
        for b in bookings:
            data.append({
                'id': b.id,
                'booking_id': str(b.booking_id)[:8].upper(),
                'user': b.user.get_full_name() or b.user.email,
                'route': f"{b.trip.route.source} → {b.trip.route.destination}",
                'amount': float(b.total_fare),
                'status': b.status,
                'booked_at': b.booked_at.strftime('%d %b %Y %I:%M %p'),
            })
        return Response(data)