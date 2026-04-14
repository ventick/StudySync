from django.urls import path
from .views import (
    login_view, logout_view, subject_list, 
    GroupListCreateAPIView, GroupDetailAPIView
)

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('subjects/', subject_list),
    path('groups/', GroupListCreateAPIView.as_view()),
    path('groups/<int:pk>/', GroupDetailAPIView.as_view()),
]