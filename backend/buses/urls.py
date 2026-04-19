from django.urls import path
from . import views

urlpatterns = [
    path('routes/', views.RouteListView.as_view()),
    path('routes/popular/', views.PopularRoutesView.as_view()),
    path('search/', views.TripSearchView.as_view()),
    path('trips/<int:pk>/', views.TripDetailView.as_view()),
    path('trips/<int:trip_id>/seats/', views.SeatAvailabilityView.as_view()),
    path('cities/', views.CityListView.as_view()),
]
