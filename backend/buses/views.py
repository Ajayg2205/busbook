from rest_framework import generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from .models import Bus, Route, Trip, Seat
from .serializers import BusSerializer, RouteSerializer, TripSerializer, TripSearchSerializer, SeatSerializer


class RouteListView(generics.ListAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['source', 'destination']


class PopularRoutesView(generics.ListAPIView):
    queryset = Route.objects.filter(popular=True).order_by('source')
    serializer_class = RouteSerializer
    permission_classes = [permissions.AllowAny]


class TripSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        source = request.query_params.get('source', '')
        destination = request.query_params.get('destination', '')
        date = request.query_params.get('date', '')
        bus_type = request.query_params.get('bus_type', '')
        min_fare = request.query_params.get('min_fare')
        max_fare = request.query_params.get('max_fare')
        sort_by = request.query_params.get('sort_by', 'departure_time')

        trips = Trip.objects.select_related(
            'bus__operator', 'route'
        ).filter(
            route__source__icontains=source,
            route__destination__icontains=destination,
            status='scheduled',
            available_seats__gt=0
        )

        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                # Search full day + next day to handle IST timezone offset
                date_start = datetime.combine(date_obj, datetime.min.time())
                date_end = datetime.combine(
                    date_obj + timedelta(days=1),
                    datetime.max.time()
                )
                trips = trips.filter(
                    departure_time__gte=date_start,
                    departure_time__lte=date_end
                )
            except ValueError:
                pass

        if bus_type:
            trips = trips.filter(bus__bus_type=bus_type)

        if min_fare:
            trips = trips.filter(fare__gte=min_fare)

        if max_fare:
            trips = trips.filter(fare__lte=max_fare)

        if sort_by == 'fare':
            trips = trips.order_by('fare')
        elif sort_by == 'duration':
            trips = trips.order_by('departure_time')
        elif sort_by == 'rating':
            trips = trips.order_by('-bus__operator__rating')
        else:
            trips = trips.order_by('departure_time')

        serializer = TripSearchSerializer(trips, many=True)
        return Response({'count': trips.count(), 'results': serializer.data})


class TripDetailView(generics.RetrieveAPIView):
    queryset = Trip.objects.select_related('bus__operator', 'route')
    serializer_class = TripSerializer
    permission_classes = [permissions.AllowAny]


class SeatAvailabilityView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, trip_id):
        seats = Seat.objects.filter(
            trip_id=trip_id
        ).order_by('seat_number')
        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)


class CityListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        sources = list(Route.objects.values_list('source', flat=True).distinct())
        destinations = list(Route.objects.values_list('destination', flat=True).distinct())
        cities = sorted(list(set(sources + destinations)))
        return Response({'cities': cities})