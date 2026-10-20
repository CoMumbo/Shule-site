from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Course,
    Enrollment,
    Grade,
    Announcement,
    Assignment,
    Submission,
)

User = get_user_model()


def score_to_letter(score):
    if score is None:
        return None
    score = float(score)
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"


class TeacherBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]


class StudentBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]


class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherBriefSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="TEACHER"),
        source="teacher",
        write_only=True,
        required=False,
        allow_null=True,
    )
    enrollment_count = serializers.IntegerField(
        source="enrollments.count", read_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id", "code", "title", "description", "credits",
            "teacher", "teacher_id", "is_open",
            "enrollment_count", "created_at",
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentBriefSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "course_id", "enrolled_at"]


class GradeSerializer(serializers.ModelSerializer):
    letter = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    course_code = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = [
            "id", "enrollment", "score", "letter",
            "student_name", "course_code", "graded_at",
        ]
        read_only_fields = ["id", "graded_at"]

    def get_letter(self, obj):
        return score_to_letter(obj.score)

    def get_student_name(self, obj):
        s = obj.enrollment.student
        return f"{s.first_name} {s.last_name}"

    def get_course_code(self, obj):
        return obj.enrollment.course.code


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    course_code = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            "id", "title", "body", "course", "course_code",
            "author_name", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_author_name(self, obj):
        return (
            f"{obj.author.first_name} {obj.author.last_name}"
            if obj.author
            else ""
        )

    def get_course_code(self, obj):
        return obj.course.code if obj.course else None


class AssignmentSerializer(serializers.ModelSerializer):
    course_code = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id", "course", "course_code", "title", "description",
            "due_date", "file", "file_url", "submission_count", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_course_code(self, obj):
        return obj.course.code

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url

    def get_submission_count(self, obj):
        return obj.submissions.count()


class SubmissionSerializer(serializers.ModelSerializer):
    student = StudentBriefSerializer(read_only=True)
    assignment_title = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id", "assignment", "assignment_title", "student",
            "file", "file_url", "submitted_at",
        ]
        read_only_fields = ["id", "submitted_at"]

    def get_assignment_title(self, obj):
        return obj.assignment.title

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url