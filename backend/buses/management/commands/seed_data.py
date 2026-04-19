"""
Management command to seed the database with sample data.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seed database with sample bus booking data'

    def handle(self, *args, **kwargs):
        from buses.models import BusOperator, Bus, Route, Trip, Seat

        self.stdout.write('Seeding database...')

        # ── Operators ───────────────────────────────────────
        operators_data = [
            {'name': 'RedBus Express', 'rating': 4.5},
            {'name': 'VRL Travels',    'rating': 4.3},
            {'name': 'SRS Travels',    'rating': 4.1},
            {'name': 'KSRTC',          'rating': 4.0},
            {'name': 'Orange Tours',   'rating': 4.6},
            {'name': 'KPN Travels',    'rating': 4.4},
        ]
        operators = []
        for od in operators_data:
            op, _ = BusOperator.objects.get_or_create(name=od['name'], defaults=od)
            operators.append(op)
        self.stdout.write(f'  ✓ Created {len(operators)} operators')

        # ── Buses ───────────────────────────────────────────
        bus_configs = [
            {'bus_type': 'ac_sleeper',   'total_seats': 36, 'amenities': ['AC', 'WiFi', 'Charging Port', 'Blanket', 'Water Bottle']},
            {'bus_type': 'sleeper',      'total_seats': 36, 'amenities': ['Charging Port', 'Water Bottle']},
            {'bus_type': 'ac_seater',    'total_seats': 45, 'amenities': ['AC', 'WiFi', 'Charging Port']},
            {'bus_type': 'volvo',        'total_seats': 42, 'amenities': ['AC', 'WiFi', 'Charging Port', 'Blanket', 'Entertainment System']},
            {'bus_type': 'semi_sleeper', 'total_seats': 40, 'amenities': ['AC', 'Charging Port']},
            {'bus_type': 'luxury',       'total_seats': 28, 'amenities': ['AC', 'WiFi', 'Charging Port', 'Blanket', 'Meals', 'Entertainment System']},
        ]
        buses = []
        for i, (op, config) in enumerate(zip(operators * 2, bus_configs * 2)):
            bus, _ = Bus.objects.get_or_create(
                bus_number=f'TN{10+i:02d}AB{1000+i}',
                defaults={**config, 'operator': op}
            )
            buses.append(bus)
        self.stdout.write(f'  ✓ Created {len(buses)} buses')

        # ── Routes ──────────────────────────────────────────
        routes_data = [
            ('Chennai', 'Bangalore',     350, 6*60,  True),
            ('Bangalore', 'Chennai',     350, 6*60,  True),
            ('Mumbai', 'Pune',           150, 3*60,  True),
            ('Pune', 'Mumbai',           150, 3*60,  True),
            ('Delhi', 'Jaipur',          280, 5*60,  True),
            ('Jaipur', 'Delhi',          280, 5*60,  False),
            ('Hyderabad', 'Vizag',       620, 8*60,  True),
            ('Vizag', 'Hyderabad',       620, 8*60,  False),
            ('Chennai', 'Madurai',       460, 7*60,  False),
            ('Madurai', 'Coimbatore',    200, 4*60,  True),
            ('Kolkata', 'Bhubaneswar',   440, 7*60,  True),
            ('Hyderabad', 'Bangalore',   570, 9*60,  True),
            ('Mumbai', 'Goa',            600, 10*60, True),
            ('Delhi', 'Agra',            200, 4*60,  False),
            ('Chennai', 'Pondicherry',   160, 3*60,  False),
        ]
        routes = []
        for src, dst, dist, dur_mins, pop in routes_data:
            route, _ = Route.objects.get_or_create(
                source=src, destination=dst,
                defaults={
                    'distance_km': dist,
                    'estimated_duration': timedelta(minutes=dur_mins),
                    'popular': pop,
                }
            )
            routes.append(route)
        self.stdout.write(f'  ✓ Created {len(routes)} routes')

        # ── Trips ───────────────────────────────────────────
        fare_map = {
            'ac_sleeper': 850, 'sleeper': 500, 'ac_seater': 600,
            'volvo': 950, 'semi_sleeper': 450, 'luxury': 1400,
        }
        trip_count = 0
        now = timezone.now()
        for day_offset in range(0, 10):  # next 10 days
            for route in routes[:8]:   # top 8 routes
                for bus in random.sample(buses, min(3, len(buses))):
                    dep_hour = random.choice([6, 9, 13, 18, 21, 23])
                    departure = now.replace(hour=dep_hour, minute=0, second=0, microsecond=0) + timedelta(days=day_offset)
                    duration_mins = int(route.estimated_duration.total_seconds() / 60)
                    arrival = departure + timedelta(minutes=duration_mins)
                    base_fare = fare_map.get(bus.bus_type, 500)
                    fare = base_fare + random.randint(-50, 100)

                    if Trip.objects.filter(bus=bus, departure_time=departure).exists():
                        continue

                    trip = Trip.objects.create(
                        bus=bus, route=route,
                        departure_time=departure,
                        arrival_time=arrival,
                        fare=fare,
                        available_seats=bus.total_seats,
                        status='scheduled',
                    )

                    # Create seats
                    seat_types = ['lower_berth', 'upper_berth'] if 'sleeper' in bus.bus_type else ['window', 'aisle']
                    for row in range(1, bus.total_seats // 2 + 1):
                        for col_idx, col in enumerate(['A', 'B']):
                            Seat.objects.create(
                                trip=trip,
                                seat_number=f'{row}{col}',
                                seat_type=seat_types[col_idx % len(seat_types)],
                                extra_charge=50 if col == 'A' else 0,
                            )
                    trip_count += 1

        self.stdout.write(f'  ✓ Created {trip_count} trips with seats')
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write('You can now login at http://localhost:8000/admin')
        self.stdout.write('Create a superuser first: python manage.py createsuperuser')
