import { api } from "./client";

export async function listMyCourses() {
  const res = await api.get("/courses/");
  return res.data;
}

export async function listCourseEnrollments(courseId) {
  const res = await api.get("/enrollments/", { params: { course: courseId } });
  return res.data;
}

export async function listCourseGrades(courseId) {
  const res = await api.get("/grades/");
  return res.data;
}