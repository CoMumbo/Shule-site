from django.contrib.auth import get_user_model, authenticate
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    AdminCreateUserSerializer,
)
from .permissions import IsAdmin

User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    user = authenticate(request, email=email, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    response = Response(
        {
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data,
        }
    )
    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        samesite="Lax",
        secure=False,
        max_age=7 * 24 * 60 * 60,
        path="/api/auth/",
    )
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_view(request):
    token = request.COOKIES.get("refresh_token")
    if not token:
        return Response(
            {"detail": "No refresh token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    try:
        refresh = RefreshToken(token)
    except TokenError:
        return Response(
            {"detail": "Invalid or expired refresh token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    response = Response({"access": str(refresh.access_token)})
    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        samesite="Lax",
        secure=False,
        max_age=7 * 24 * 60 * 60,
        path="/api/auth/",
    )
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    response = Response({"detail": "Logged out."})
    response.delete_cookie("refresh_token", path="/api/auth/")
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


class TeacherListView(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Public list of teachers — used by Faculty page."""

    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return User.objects.filter(role="TEACHER").order_by("last_name", "first_name")


class StudentListView(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Admin-only list of students — used by admin enrollment UI."""

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.filter(role="STUDENT").order_by("last_name", "first_name")


class AdminCreateUserView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """Admin-only user list + creation. Public signup stays student-only."""

    serializer_class = AdminCreateUserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return Response(UserSerializer(qs, many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)