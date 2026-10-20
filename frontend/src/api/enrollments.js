import { api } from "./client";

export async function listEnrollments(params = {}) {
  const res = await api.get("/enrollments/", { params });
  return res.data;
}

export async function createEnrollment(courseId) {
  const res = await api.post("/enrollments/", { course_id: courseId });
  return res.data;
}