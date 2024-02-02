from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db.models.deletion import CASCADE
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model  

# Create your models here.

class UserProfileManager(BaseUserManager):
    """
    Defines user creation fields and manages to save user
    """
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, email,username, password=None):
        user = self.create_user(
            email,
            password=password,
            username=username
        )
        user.is_staff = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None):
        user = self.create_user(
            email,
            password=password,
            username=username
        )
        user.is_staff = True
        user.is_admin = True
        user.save(using=self._db)
        return user


class UserProfile(AbstractBaseUser):
    """
    Creates a customized database table for user using customized user manager
    """

    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email',]

    objects = UserProfileManager()

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True
class TokenBlacklist(models.Model):
    token = models.CharField(max_length=500)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user}'s Token"
