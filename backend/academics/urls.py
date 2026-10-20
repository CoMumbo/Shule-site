from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    EnrollmentViewSet,
    GradeViewSet,
    AnnouncementViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    dashboard_stats,
)

router = DefaultRouter()
router.register("courses", CourseViewSet, basename="course")
router.register("enrollments", EnrollmentViewSet, basename="enrollment")
router.register("grades", GradeViewSet, basename="grade")
router.register("announcements", AnnouncementViewSet, basename="announcement")
router.register("assignments", AssignmentViewSet, basename="assignment")
router.register("submissions", SubmissionViewSet, basename="submission")

urlpatterns = [
    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),
] + router.urls