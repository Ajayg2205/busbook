import razorpay
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from .models import Booking, Passenger, Review
from .serializers import BookingSerializer, ReviewSerializer, BookingCreateSerializer
from buses.models import Trip, Seat

class CreateRazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')  # in rupees
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        order = client.order.create({
            'amount': int(float(amount) * 100),  # convert to paise
            'currency': 'INR',
            'payment_capture': 1,
        })
        return Response({
            'order_id': order['id'],
            'amount': order['amount'],
            'key': settings.RAZORPAY_KEY_ID,
        })


class VerifyRazorpayPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': request.data.get('razorpay_order_id'),
                'razorpay_payment_id': request.data.get('razorpay_payment_id'),
                'razorpay_signature': request.data.get('razorpay_signature'),
            })
            return Response({'verified': True})
        except Exception:
            return Response({'verified': False}, status=400)

class CreateBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data
        
        try:
            trip = Trip.objects.select_for_update().get(id=data['trip_id'])
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found.'}, status=404)
            
        seat_ids = data['seat_ids']

        # Validate seats - convert queryset to list immediately
        seats_list = list(Seat.objects.select_for_update().filter(id__in=seat_ids, trip=trip))
        
        if len(seats_list) != len(seat_ids):
            return Response({'error': 'One or more seats not found.'}, status=400)

        if any(s.is_booked for s in seats_list):
            return Response({'error': 'One or more seats already booked.'}, status=400)

        # Calculate fare
        base_fare = float(trip.fare) * len(seat_ids)
        extra = sum(float(s.extra_charge) for s in seats_list)
        convenience_fee = round(base_fare * 0.02, 2)
        discount = 0.0
        coupon = data.get('coupon_code', '')
        
        if coupon == 'FIRST50':
            discount = min(50.0, base_fare * 0.1)
        elif coupon == 'BUSBOOK20':
            discount = base_fare * 0.2
        elif coupon == 'SAVE100':
            discount = min(100.0, base_fare)

        # Create booking
        booking = Booking.objects.create(
            user=request.user,
            trip=trip,
            total_fare=base_fare + extra,
            convenience_fee=convenience_fee,
            discount=discount,
            coupon_code=coupon,
            status='confirmed',
            payment_status='paid',
            payment_method=data.get('payment_method', 'online'),
        )

        # Create passengers using list index
        for i, passenger_data in enumerate(data['passengers']):
            seat = seats_list[i]
            Passenger.objects.create(
                booking=booking,
                seat=seat,
                name=passenger_data['name'],
                age=passenger_data['age'],
                gender=passenger_data['gender'],
                id_type=passenger_data.get('id_type', ''),
                id_number=passenger_data.get('id_number', ''),
            )
            seat.is_booked = True
            seat.save()

        # Update trip available seats
        trip.available_seats -= len(seat_ids)
        trip.save()

        # Send confirmation email
        try:
            send_mail(
                subject=f'Booking Confirmed - {booking.booking_id}',
                message=f'Your booking {booking.booking_id} is confirmed. Total: Rs.{booking.final_amount}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(BookingSerializer(booking).data, status=201)


class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related('trip__bus__operator', 'trip__route')


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class CancelBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)

        if booking.status == 'cancelled':
            return Response({'error': 'Booking already cancelled.'}, status=400)

        booking.status = 'cancelled'
        booking.payment_status = 'refunded'
        booking.cancellation_reason = request.data.get('reason', '')
        booking.save()

        for passenger in booking.passengers.all():
            if passenger.seat:
                passenger.seat.is_booked = False
                passenger.seat.save()

        booking.trip.available_seats += booking.passengers.count()
        booking.trip.save()

        return Response({'message': 'Booking cancelled. Refund will be processed in 5-7 business days.'})


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)