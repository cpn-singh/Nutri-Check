from django.urls import path
from .views import HealthAssessmentView

urlpatterns = [
    path('calculate/', HealthAssessmentView.as_view(), name='calculate-health'),
]
