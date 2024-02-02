#custom_auth.authentication.urls.py

from django.urls import path
from . views import SignupAPIView, LogoutView, get_user_details
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

app_name = 'authentication'

urlpatterns = [
    path('signup/', SignupAPIView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', get_user_details, name='get_user_details'),

    # JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
