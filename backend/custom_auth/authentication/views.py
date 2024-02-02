from core.models import UserProfile
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from . serializers import SignupSerializer
from .models import TokenBlacklist

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken


# Create your views here.
class SignupAPIView(APIView):
    """
    API view for sign up API
    """
    permission_classes = []
    def post(self, request):
        password = request.POST.get('password', None)
        confirm_password = request.POST.get('confirm_password', None)
        
        if password == confirm_password:
            serializer = SignupSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            data = serializer.data
            response = status.HTTP_201_CREATED
        else:
            data = ''
            raise ValidationError(
                {'password_mismatch': 'Password fields didn not match.'})
        return Response(data, status=response)
    

from rest_framework_simplejwt.tokens import RefreshToken
from .models import TokenBlacklist

class LogoutView(APIView):
    def post(self, request):
        try:
            access_token = request.data.get("token")
            print(f"Received access token: {access_token}")  # Debug print

            # Blacklist the access token
            token_blacklist = TokenBlacklist(token=access_token, user=request.user)
            token_blacklist.save()

            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error during logout: {str(e)}")  # Debug print
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    user = request.user
    # Assuming you have a UserProfile model related to your user model
    # Adjust this based on your actual models
    user_profile_data = {
        'username': user.username,
        'email': user.email,
        # Add more fields as needed
    }
    return Response(user_profile_data)