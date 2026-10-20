from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("teachers", views.TeacherListView, basename="teacher")
router.register("students", views.StudentListView, basename="student")
router.register("users", views.AdminCreateUserView, basename="admin-user")

urlpatterns = [
    path("", include(router.urls)),
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("refresh/", views.refresh_view, name="refresh"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.me_view, name="me"),
]