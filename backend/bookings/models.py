from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]
    booking_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    trip = models.ForeignKey('buses.Trip', on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=50, blank=True)
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    convenience_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=20, blank=True)
    booked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-booked_at']

    def __str__(self):
        return f"Booking {self.booking_id} by {self.user.email}"

    @property
    def final_amount(self):
        return self.total_fare + self.convenience_fee - self.discount


class Passenger(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='passengers')
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    seat = models.ForeignKey('buses.Seat', on_delete=models.SET_NULL, null=True)
    id_type = models.CharField(max_length=30, blank=True)
    id_number = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.name} - Seat {self.seat.seat_number if self.seat else 'N/A'}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey('buses.Trip', on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    cleanliness = models.IntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    punctuality = models.IntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    staff = models.IntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'trip']

    def __str__(self):
        return f"Review by {self.user.email} for trip {self.trip.id}"
