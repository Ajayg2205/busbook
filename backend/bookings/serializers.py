from rest_framework import serializers
from .models import Booking, Passenger, Review
from buses.serializers import TripSearchSerializer


class PassengerSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='seat.seat_number', read_only=True)
    class Meta:
        model = Passenger
        fields = ['id', 'name', 'age', 'gender', 'seat', 'seat_number', 'id_type', 'id_number']


class BookingSerializer(serializers.ModelSerializer):
    passengers = PassengerSerializer(many=True, read_only=True)
    trip = TripSearchSerializer(read_only=True)
    final_amount = serializers.ReadOnlyField()
    booking_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'trip', 'passengers', 'status', 'payment_status',
                  'total_fare', 'convenience_fee', 'discount', 'final_amount',
                  'coupon_code', 'payment_method', 'booked_at']


class PassengerInputSerializer(serializers.Serializer):
    name = serializers.CharField()
    age = serializers.IntegerField(min_value=1, max_value=120)
    gender = serializers.ChoiceField(choices=['M', 'F', 'O'])
    id_type = serializers.CharField(required=False, default='', allow_blank=True)
    id_number = serializers.CharField(required=False, default='', allow_blank=True)


class BookingCreateSerializer(serializers.Serializer):
    trip_id = serializers.IntegerField()
    seat_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    passengers = PassengerInputSerializer(many=True)
    payment_method = serializers.CharField(default='online', allow_blank=True)
    coupon_code = serializers.CharField(required=False, default='', allow_blank=True)

    def validate(self, attrs):
        if len(attrs['seat_ids']) != len(attrs['passengers']):
            raise serializers.ValidationError("Seat count must match passenger count.")
        return attrs


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'trip', 'rating', 'comment',
                  'cleanliness', 'punctuality', 'staff', 'created_at']
        read_only_fields = ['user']