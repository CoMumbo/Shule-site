from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.permissions import (
    IsAdmin,
    IsTeacher,
    IsStudent,
    IsAdminOrReadOnly,
    IsAdminOrTeacherOfCourse,
)
from .models import (
    Course,
    Enrollment,
    Grade,
    Announcement,
    Assignment,
    Submission,
)
from .serializers import (
    CourseSerializer,
    EnrollmentSerializer,
    GradeSerializer,
    AnnouncementSerializer,
    AssignmentSerializer,
    SubmissionSerializer,
)
from .stats import stats_for


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("teacher").all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("open") == "true":
            qs = qs.filter(is_open=True)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(code__icontains=search)
        return qs


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.select_related("student", "course", "course__teacher")
        if user.role == "ADMIN":
            qs = qs.all()
        elif user.role == "TEACHER":
            qs = qs.filter(course__teacher=user)
        else:
            qs = qs.filter(student=user)

        course_id = self.request.query_params.get("course")
        if course_id:
            qs = qs.filter(course_id=course_id)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]

        if user.role == "STUDENT":
            if not course.is_open:
                raise PermissionDenied("This course is not open for enrollment.")
            serializer.save(student=user)
            return

        if user.role == "ADMIN":
            student_id = self.request.data.get("student_id")
            if not student_id:
                raise PermissionDenied("student_id required for admin enrollment.")
            serializer.save(student_id=student_id)
            return

        raise PermissionDenied("Only students (self) or admins can enroll.")


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Grade.objects.select_related(
            "enrollment__student", "enrollment__course"
        )
        if user.role == "ADMIN":
            return qs.all()
        if user.role == "TEACHER":
            return qs.filter(enrollment__course__teacher=user)
        return qs.filter(enrollment__student=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ("TEACHER", "ADMIN"):
            raise PermissionDenied("Only teachers/admins can grade.")

        enrollment = serializer.validated_data["enrollment"]
        if user.role == "TEACHER" and enrollment.course.teacher_id != user.id:
            raise PermissionDenied("You don't teach this course.")

        serializer.save(graded_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        enrollment = serializer.validated_data.get(
            "enrollment", serializer.instance.enrollment
        )
        if user.role == "TEACHER" and enrollment.course.teacher_id != user.id:
            raise PermissionDenied("You don't teach this course.")
        serializer.save(graded_by=user)


class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Announcement.objects.select_related("course", "author").all()
        if self.request.query_params.get("scope") == "site":
            qs = qs.filter(course__isnull=True)
        course_id = self.request.query_params.get("course")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ("ADMIN", "TEACHER"):
            raise PermissionDenied("Only admins/teachers can post announcements.")
        course = serializer.validated_data.get("course")
        if user.role == "TEACHER" and course and course.teacher_id != user.id:
            raise PermissionDenied("You don't teach this course.")
        if user.role == "TEACHER" and not course:
            raise PermissionDenied("Teachers can only post to their own courses.")
        serializer.save(author=user)


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        qs = Assignment.objects.select_related("course").all()
        if user.role == "ADMIN":
            return qs
        if user.role == "TEACHER":
            return qs.filter(course__teacher=user)
        return qs.filter(course__enrollments__student=user).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ("TEACHER", "ADMIN"):
            raise PermissionDenied("Only teachers/admins can create assignments.")
        course = serializer.validated_data["course"]
        if user.role == "TEACHER" and course.teacher_id != user.id:
            raise PermissionDenied("You don't teach this course.")
        serializer.save(created_by=user)


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related(
            "student", "assignment", "assignment__course"
        )
        if user.role == "ADMIN":
            return qs.all()
        if user.role == "TEACHER":
            return qs.filter(assignment__course__teacher=user)
        return qs.filter(student=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "STUDENT":
            raise PermissionDenied("Only students can submit work.")
        assignment = serializer.validated_data["assignment"]
        enrolled = Enrollment.objects.filter(
            student=user, course=assignment.course
        ).exists()
        if not enrolled:
            raise PermissionDenied("You're not enrolled in this course.")
        serializer.save(student=user)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    return Response(stats_for(request.user))