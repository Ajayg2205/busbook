from django.db import models


class BusOperator(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='operators/', null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.0)
    total_trips = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Bus(models.Model):
    BUS_TYPES = [
        ('sleeper', 'Sleeper'),
        ('semi_sleeper', 'Semi Sleeper'),
        ('seater', 'Seater'),
        ('ac_sleeper', 'AC Sleeper'),
        ('ac_seater', 'AC Seater'),
        ('luxury', 'Luxury'),
        ('volvo', 'Volvo AC'),
    ]
    operator = models.ForeignKey(BusOperator, on_delete=models.CASCADE, related_name='buses')
    bus_number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=30, choices=BUS_TYPES)
    total_seats = models.IntegerField(default=40)
    amenities = models.JSONField(default=list)
    images = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.bus_number} - {self.operator.name}"


class Route(models.Model):
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance_km = models.FloatField()
    estimated_duration = models.DurationField()
    popular = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.source} → {self.destination}"


class Trip(models.Model):
    STATUS_CHOICES = [('scheduled', 'Scheduled'), ('departed', 'Departed'),
                      ('arrived', 'Arrived'), ('cancelled', 'Cancelled')]
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='trips')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    fare = models.DecimalField(max_digits=8, decimal_places=2)
    available_seats = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['departure_time']
        indexes = [
            models.Index(fields=['route', 'departure_time']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.route} on {self.departure_time.date()}"


class Seat(models.Model):
    SEAT_TYPES = [('window', 'Window'), ('aisle', 'Aisle'), ('middle', 'Middle'),
                  ('lower_berth', 'Lower Berth'), ('upper_berth', 'Upper Berth')]
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    seat_type = models.CharField(max_length=20, choices=SEAT_TYPES, default='window')
    is_booked = models.BooleanField(default=False)
    extra_charge = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    class Meta:
        unique_together = ['trip', 'seat_number']

    def __str__(self):
        return f"Seat {self.seat_number} - Trip {self.trip.id}"