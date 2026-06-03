from django.http import JsonResponse


def ping(request):
    """Simple health-check endpoint for the frontend to verify connectivity."""
    return JsonResponse({"status": "ok", "message": "pong"})
