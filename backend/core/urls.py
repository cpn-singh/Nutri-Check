from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "Nutri-Check Backend API",
        "version": "1.0",
        "endpoints": {
            "calculate": "/api/calculate/"
        }
    })

urlpatterns = [
    path('', health_check, name='root_health_check'),
    path('admin/', admin.site.urls),
    path('api/', include('assessment.urls')),
]
