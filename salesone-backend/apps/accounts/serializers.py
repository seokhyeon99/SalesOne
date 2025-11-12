from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.common.serializers import BaseSerializer
from django.utils.translation import gettext_lazy as _
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer, PasswordChangeSerializer

User = get_user_model()


class UserSerializer(BaseSerializer):
    """
    Serializer for the User model.
    """
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 
                  'is_staff', 'date_joined', 'last_login', 'password',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'is_staff', 'date_joined', 'last_login',
                             'created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user with required password field.
    """
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password']
        
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the user profile (public information).
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name']
        
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_staff')
        read_only_fields = ('email', 'is_staff')


class CustomRegisterSerializer(RegisterSerializer):
    username = None
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def get_cleaned_data(self):
        return {
            'password1': self.validated_data.get('password1', ''),
            'email': self.validated_data.get('email', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', '')
        }


class CustomLoginSerializer(LoginSerializer):
    username = None
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)


class CustomPasswordResetSerializer(PasswordResetSerializer):
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("이메일 주소를 찾을 수 없습니다."))
        return value


class CustomPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        if len(attrs['new_password1']) < 8:
            raise serializers.ValidationError({
                'new_password1': _("비밀번호는 최소 8자 이상이어야 합니다.")
            })
        return attrs


class CustomPasswordChangeSerializer(PasswordChangeSerializer):
    def validate_new_password1(self, value):
        value = super().validate_new_password1(value)
        if len(value) < 8:
            raise serializers.ValidationError(_("비밀번호는 최소 8자 이상이어야 합니다."))
        return value
