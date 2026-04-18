from django.urls import path
from .views import (
    login_view, 
    logout_view, 
    subject_list, 
    GroupListCreateAPIView, 
    GroupDetailAPIView,
    join_group,    
    leave_group,   
    remove_member  
)

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('subjects/', subject_list),
    path('groups/', GroupListCreateAPIView.as_view()),
    path('groups/<int:pk>/', GroupDetailAPIView.as_view()),
    path('groups/<int:pk>/join/', join_group),
    path('groups/<int:pk>/leave/', leave_group),
    path('groups/<int:pk>/remove-member/', remove_member),
]