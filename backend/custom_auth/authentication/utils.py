# utils.py
from rest_framework_simplejwt.tokens import RefreshToken
from .models import TokenBlacklist

def create_tokens_for_user(user):
    # Revoke previous refresh tokens for the user
    TokenBlacklist.objects.filter(user=user).delete()

    # Generate new tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    return {
        'refresh': str(refresh),
        'access': access_token,
    }
