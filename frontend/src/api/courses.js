import { api } from "./client";

export async function listCourses(params = {}) {
  const res = await api.get("/courses/", { params });
  return res.data;
}

export async function getCourse(id) {
  const res = await api.get(`/courses/${id}/`);
  return res.data;
}