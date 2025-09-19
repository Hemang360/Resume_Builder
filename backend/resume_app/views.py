from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

def index(request):
    return JsonResponse({'message': 'Welcome to Resume App!'})

@csrf_exempt
def resume_create(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            return JsonResponse({"message": "Resume received", "data": data}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)
