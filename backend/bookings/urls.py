from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListView.as_view()),
    path('create/', views.CreateBookingView.as_view()),
    path('<int:pk>/', views.BookingDetailView.as_view()),
    path('<int:pk>/cancel/', views.CancelBookingView.as_view()),
    path('reviews/', views.ReviewCreateView.as_view()),
    path('razorpay/create-order/', views.CreateRazorpayOrderView.as_view()),
    path('razorpay/verify/', views.VerifyRazorpayPaymentView.as_view()),
]
