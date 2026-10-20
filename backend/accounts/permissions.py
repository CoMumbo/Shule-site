from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "TEACHER"


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "STUDENT"


class IsAdminOrReadOnly(BasePermission):
    """Anyone can read; only admins can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsAdminOrTeacherOfCourse(BasePermission):
    """
    Object-level: admin can do anything; teacher can edit their own course.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == "ADMIN":
            return True
        return (
            request.user.role == "TEACHER"
            and getattr(obj, "teacher_id", None) == request.user.id
        )