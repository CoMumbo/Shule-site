from django.contrib import admin
from .models import (
    Course,
    Enrollment,
    Grade,
    Announcement,
    Assignment,
    Submission,
)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["code", "title", "teacher", "credits", "is_open"]
    list_filter = ["is_open", "teacher"]
    search_fields = ["code", "title"]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["student", "course", "enrolled_at"]
    list_filter = ["course"]
    search_fields = ["student__email", "course__code"]


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ["enrollment", "score", "graded_by", "graded_at"]
    list_filter = ["graded_by"]


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "author", "created_at"]
    list_filter = ["course"]
    search_fields = ["title", "body"]


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "due_date", "created_by"]
    list_filter = ["course"]
    search_fields = ["title"]


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ["assignment", "student", "submitted_at"]
    list_filter = ["assignment__course"]
    search_fields = ["student__email", "assignment__title"]