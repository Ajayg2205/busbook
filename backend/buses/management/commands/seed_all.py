from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seed complete India bus routes data'

    def handle(self, *args, **kwargs):
        from buses.models import BusOperator, Bus, Route, Trip, Seat

        # Clear old data
        self.stdout.write('Clearing old data...')
        Seat.objects.all().delete()
        Trip.objects.all().delete()
        Route.objects.all().delete()
        Bus.objects.all().delete()
        BusOperator.objects.all().delete()

        # Operators
        self.stdout.write('Creating operators...')
        operators_data = [
            {'name': 'RedBus Express', 'rating': 4.5},
            {'name': 'VRL Travels', 'rating': 4.3},
            {'name': 'SRS Travels', 'rating': 4.1},
            {'name': 'KPN Travels', 'rating': 4.4},
            {'name': 'Orange Tours', 'rating': 4.6},
            {'name': 'TNSTC', 'rating': 3.9},
            {'name': 'SETC', 'rating': 4.0},
            {'name': 'Parveen Travels', 'rating': 4.2},
            {'name': 'Kallada Travels', 'rating': 4.3},
            {'name': 'Paulo Travels', 'rating': 4.1},
            {'name': 'Kesineni Travels', 'rating': 4.0},
            {'name': 'IntrCity SmartBus', 'rating': 4.7},
        ]
        operators = [BusOperator.objects.create(**o) for o in operators_data]
        self.stdout.write(f'  ✓ {len(operators)} operators')

        # Buses
        self.stdout.write('Creating buses...')
        bus_configs = [
            {'bus_type': 'ac_sleeper', 'total_seats': 36, 'amenities': ['AC', 'WiFi', 'Charging Port', 'Blanket', 'Water Bottle']},
            {'bus_type': 'sleeper', 'total_seats': 36, 'amenities': ['Charging Port', 'Water Bottle']},
            {'bus_type': 'ac_seater', 'total_seats': 45, 'amenities': ['AC', 'WiFi', 'Charging Port']},
            {'bus_type': 'volvo', 'total_seats': 42, 'amenities': ['AC', 'WiFi', 'Charging Port', 'Blanket', 'Entertainment System']},
            {'bus_type': 'semi_sleeper', 'total_seats': 40, 'amenities': ['AC', 'Charging Port']},
            {'bus_type': 'luxury', 'total_seats': 28, 'amenities': ['AC', 'WiFi', 'Charging Port', 'Blanket', 'Meals']},
            {'bus_type': 'seater', 'total_seats': 50, 'amenities': ['Charging Port']},
            {'bus_type': 'ac_sleeper', 'total_seats': 36, 'amenities': ['AC', 'WiFi', 'Charging Port', 'Blanket']},
        ]
        buses = []
        for i in range(40):
            op = operators[i % len(operators)]
            config = bus_configs[i % len(bus_configs)]
            bus = Bus.objects.create(
                bus_number=f'TN{10 + i:02d}AB{1000 + i}',
                operator=op,
                **config
            )
            buses.append(bus)
        self.stdout.write(f'  ✓ {len(buses)} buses')

        # Routes
        self.stdout.write('Creating routes...')
        routes_data = [
            ('Chennai', 'Coimbatore', 497, 480, True),
            ('Coimbatore', 'Chennai', 497, 480, True),
            ('Chennai', 'Madurai', 462, 420, True),
            ('Madurai', 'Chennai', 462, 420, True),
            ('Chennai', 'Trichy', 330, 300, True),
            ('Trichy', 'Chennai', 330, 300, True),
            ('Chennai', 'Salem', 340, 300, True),
            ('Salem', 'Chennai', 340, 300, True),
            ('Chennai', 'Tirunelveli', 630, 540, True),
            ('Tirunelveli', 'Chennai', 630, 540, True),
            ('Chennai', 'Vellore', 145, 150, True),
            ('Vellore', 'Chennai', 145, 150, True),
            ('Chennai', 'Pondicherry', 162, 180, True),
            ('Pondicherry', 'Chennai', 162, 180, True),
            ('Chennai', 'Kanyakumari', 705, 600, True),
            ('Kanyakumari', 'Chennai', 705, 600, True),
            ('Chennai', 'Erode', 390, 360, True),
            ('Erode', 'Chennai', 390, 360, True),
            ('Chennai', 'Tiruppur', 450, 420, True),
            ('Tiruppur', 'Chennai', 450, 420, True),
            ('Chennai', 'Thanjavur', 310, 300, True),
            ('Thanjavur', 'Chennai', 310, 300, True),
            ('Chennai', 'Dindigul', 420, 390, True),
            ('Dindigul', 'Chennai', 420, 390, True),
            ('Chennai', 'Nagercoil', 680, 570, True),
            ('Nagercoil', 'Chennai', 680, 570, True),
            ('Chennai', 'Kumbakonam', 280, 270, True),
            ('Kumbakonam', 'Chennai', 280, 270, True),
            ('Chennai', 'Cuddalore', 160, 180, False),
            ('Cuddalore', 'Chennai', 160, 180, False),
            ('Chennai', 'Villupuram', 162, 180, False),
            ('Villupuram', 'Chennai', 162, 180, False),
            ('Chennai', 'Namakkal', 360, 330, False),
            ('Namakkal', 'Chennai', 360, 330, False),
            ('Chennai', 'Karur', 380, 360, False),
            ('Karur', 'Chennai', 380, 360, False),
            ('Chennai', 'Hosur', 340, 300, False),
            ('Hosur', 'Chennai', 340, 300, False),
            ('Chennai', 'Krishnagiri', 320, 300, False),
            ('Krishnagiri', 'Chennai', 320, 300, False),
            ('Madurai', 'Coimbatore', 210, 210, True),
            ('Coimbatore', 'Madurai', 210, 210, True),
            ('Madurai', 'Trichy', 135, 150, True),
            ('Trichy', 'Madurai', 135, 150, True),
            ('Madurai', 'Tirunelveli', 170, 180, True),
            ('Tirunelveli', 'Madurai', 170, 180, True),
            ('Coimbatore', 'Trichy', 200, 210, True),
            ('Trichy', 'Coimbatore', 200, 210, True),
            ('Coimbatore', 'Ooty', 90, 120, True),
            ('Ooty', 'Coimbatore', 90, 120, True),
            ('Coimbatore', 'Salem', 150, 150, True),
            ('Salem', 'Coimbatore', 150, 150, True),
            ('Trichy', 'Thanjavur', 60, 90, False),
            ('Thanjavur', 'Trichy', 60, 90, False),
            ('Salem', 'Trichy', 140, 150, False),
            ('Trichy', 'Salem', 140, 150, False),
            ('Chennai', 'Bangalore', 350, 360, True),
            ('Bangalore', 'Chennai', 350, 360, True),
            ('Chennai', 'Hyderabad', 625, 540, True),
            ('Hyderabad', 'Chennai', 625, 540, True),
            ('Chennai', 'Mumbai', 1338, 1080, True),
            ('Mumbai', 'Chennai', 1338, 1080, True),
            ('Chennai', 'Pune', 1190, 960, True),
            ('Pune', 'Chennai', 1190, 960, True),
            ('Chennai', 'Vijayawada', 430, 390, True),
            ('Vijayawada', 'Chennai', 430, 390, True),
            ('Chennai', 'Vizag', 780, 660, True),
            ('Vizag', 'Chennai', 780, 660, True),
            ('Coimbatore', 'Bangalore', 360, 330, True),
            ('Bangalore', 'Coimbatore', 360, 330, True),
            ('Madurai', 'Bangalore', 450, 420, True),
            ('Bangalore', 'Madurai', 450, 420, True),
            ('Trichy', 'Bangalore', 380, 360, True),
            ('Bangalore', 'Trichy', 380, 360, True),
            ('Madurai', 'Hyderabad', 810, 660, True),
            ('Hyderabad', 'Madurai', 810, 660, True),
            ('Mumbai', 'Pune', 150, 180, True),
            ('Pune', 'Mumbai', 150, 180, True),
            ('Mumbai', 'Goa', 600, 540, True),
            ('Goa', 'Mumbai', 600, 540, True),
            ('Mumbai', 'Hyderabad', 750, 630, True),
            ('Hyderabad', 'Mumbai', 750, 630, True),
            ('Mumbai', 'Ahmedabad', 530, 480, True),
            ('Ahmedabad', 'Mumbai', 530, 480, True),
            ('Delhi', 'Jaipur', 280, 300, True),
            ('Jaipur', 'Delhi', 280, 300, True),
            ('Delhi', 'Agra', 200, 240, True),
            ('Agra', 'Delhi', 200, 240, True),
            ('Delhi', 'Chandigarh', 260, 270, True),
            ('Chandigarh', 'Delhi', 260, 270, True),
            ('Delhi', 'Lucknow', 555, 480, True),
            ('Lucknow', 'Delhi', 555, 480, True),
            ('Hyderabad', 'Bangalore', 570, 540, True),
            ('Bangalore', 'Hyderabad', 570, 540, True),
            ('Hyderabad', 'Vizag', 620, 540, True),
            ('Vizag', 'Hyderabad', 620, 540, True),
            ('Hyderabad', 'Pune', 550, 480, True),
            ('Pune', 'Hyderabad', 550, 480, True),
            ('Bangalore', 'Goa', 560, 510, True),
            ('Goa', 'Bangalore', 560, 510, True),
            ('Kolkata', 'Bhubaneswar', 440, 420, True),
            ('Bhubaneswar', 'Kolkata', 440, 420, True),
        ]

        routes = []
        for src, dst, dist, dur_mins, pop in routes_data:
            route = Route.objects.create(
                source=src, destination=dst,
                distance_km=dist,
                estimated_duration=timedelta(minutes=dur_mins),
                popular=pop
            )
            routes.append(route)
        self.stdout.write(f'  ✓ {len(routes)} routes')

        # ── Trips + Seats ────────────────────────────────────────────────────────
        # Each Trip is saved individually to get its PK right away.
        # All Seat objects for the day are collected in memory, then inserted
        # in ONE bulk_create call (~14k rows → 1 query instead of ~14k queries).
        # ─────────────────────────────────────────────────────────────────────────
        self.stdout.write('Creating trips and seats...')
        fare_map = {
            'ac_sleeper': 900, 'sleeper': 500, 'ac_seater': 650,
            'volvo': 1000, 'semi_sleeper': 450, 'luxury': 1500, 'seater': 300,
        }
        departure_hours = [6, 7, 9, 11, 13, 15, 18, 20, 21, 22, 23]
        now = timezone.now()
        trip_count = 0
        seat_count = 0

        for day_offset in range(1, 16):
            day_seats = []
            day_trips = 0

            for route in routes:
                num_buses = random.randint(3, 5)
                selected_buses = random.sample(buses, min(num_buses, len(buses)))
                selected_hours = random.sample(departure_hours, num_buses)

                for bus, dep_hour in zip(selected_buses, selected_hours):
                    departure = now.replace(
                        hour=dep_hour, minute=0, second=0, microsecond=0
                    ) + timedelta(days=day_offset)
                    duration_mins = int(route.estimated_duration.total_seconds() / 60)
                    arrival = departure + timedelta(minutes=duration_mins)
                    base_fare = fare_map.get(bus.bus_type, 500)
                    fare = max(200, base_fare + random.randint(-100, 200))

                    # Save trip → gets a real PK immediately
                    trip = Trip.objects.create(
                        bus=bus,
                        route=route,
                        departure_time=departure,
                        arrival_time=arrival,
                        fare=fare,
                        available_seats=bus.total_seats,
                        status='scheduled',
                    )
                    day_trips += 1

                    # Build seat objects in memory (trip.pk is now valid)
                    is_sleeper = 'sleeper' in bus.bus_type
                    seat_types = ['lower_berth', 'upper_berth'] if is_sleeper else ['window', 'aisle']
                    cols = ['A', 'B'] if is_sleeper else ['A', 'B', 'C', 'D']
                    num_rows = bus.total_seats // len(cols)

                    for row in range(1, num_rows + 1):
                        for col_idx, col in enumerate(cols):
                            day_seats.append(Seat(
                                trip=trip,
                                seat_number=f'{row}{col}',
                                seat_type=seat_types[col_idx % len(seat_types)],
                                extra_charge=50 if col in ['A', 'C'] else 0,
                            ))

            # ONE bulk INSERT for all seats this day
            Seat.objects.bulk_create(day_seats, batch_size=1000)
            trip_count += day_trips
            seat_count += len(day_seats)
            self.stdout.write(f'  Day {day_offset}/15 — {day_trips} trips, {len(day_seats)} seats')

        self.stdout.write(self.style.SUCCESS(f'\n✅ Done!'))
        self.stdout.write(f'   • {len(operators)} operators')
        self.stdout.write(f'   • {len(buses)} buses')
        self.stdout.write(f'   • {len(routes)} routes')
        self.stdout.write(f'   • {trip_count} trips (next 15 days)')
        self.stdout.write(f'   • {seat_count} seats')
        self.stdout.write(f'\nSearch: Chennai → Coimbatore → April 19, 2026')