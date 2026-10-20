from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from .models import Course, Enrollment, Grade

User = get_user_model()


def student_stats(user):
    enrollments = Enrollment.objects.filter(student=user)
    course_ids = list(enrollments.values_list("course_id", flat=True))
    grades = Grade.objects.filter(enrollment__student=user)

    avg = grades.aggregate(avg=Avg("score"))["avg"]
    letters = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    for g in grades:
        s = float(g.score)
        if s >= 90:
            letters["A"] += 1
        elif s >= 80:
            letters["B"] += 1
        elif s >= 70:
            letters["C"] += 1
        elif s >= 60:
            letters["D"] += 1
        else:
            letters["F"] += 1

    return {
        "role": "STUDENT",
        "enrolled_courses": len(course_ids),
        "average_score": round(float(avg), 2) if avg else None,
        "letter_breakdown": letters,
    }


def teacher_stats(user):
    courses = Course.objects.filter(teacher=user)
    enrollment_qs = Enrollment.objects.filter(course__teacher=user)
    grades = Grade.objects.filter(enrollment__course__teacher=user)

    enrollment_by_course = list(
        courses.annotate(count=Count("enrollments"))
        .values("code", "count")
        .order_by("code")
    )

    avg = grades.aggregate(avg=Avg("score"))["avg"]

    return {
        "role": "TEACHER",
        "courses_taught": courses.count(),
        "total_students": enrollment_qs.values("student").distinct().count(),
        "average_score": round(float(avg), 2) if avg else None,
        "enrollment_by_course": enrollment_by_course,
    }


def admin_stats(user):
    users_by_role = list(
        User.objects.values("role").annotate(count=Count("id")).order_by("role")
    )
    enrollment_by_course = list(
        Course.objects.annotate(count=Count("enrollments"))
        .values("code", "count")
        .order_by("-count", "code")
    )

    return {
        "role": "ADMIN",
        "total_users": User.objects.count(),
        "users_by_role": users_by_role,
        "total_courses": Course.objects.count(),
        "total_enrollments": Enrollment.objects.count(),
        "enrollment_by_course": enrollment_by_course,
    }


def stats_for(user):
    if user.role == "STUDENT":
        return student_stats(user)
    if user.role == "TEACHER":
        return teacher_stats(user)
    if user.role == "ADMIN":
        return admin_stats(user)
    return {}