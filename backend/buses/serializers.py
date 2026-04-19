from rest_framework import serializers
from .models import Bus, BusOperator, Route, Trip, Seat


class BusOperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusOperator
        fields = '__all__'


class BusSerializer(serializers.ModelSerializer):
    operator = BusOperatorSerializer(read_only=True)
    class Meta:
        model = Bus
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    seats = SeatSerializer(many=True, read_only=True)
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = '__all__'

    def get_duration_minutes(self, obj):
        delta = obj.arrival_time - obj.departure_time
        return int(delta.total_seconds() // 60)


class TripSearchSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    available_seats_count = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ['id', 'bus', 'route', 'departure_time', 'arrival_time',
                  'fare', 'available_seats', 'available_seats_count', 'duration_minutes', 'status']

    def get_available_seats_count(self, obj):
        return obj.seats.filter(is_booked=False).count()

    def get_duration_minutes(self, obj):
        delta = obj.arrival_time - obj.departure_time
        return int(delta.total_seconds() // 60)
