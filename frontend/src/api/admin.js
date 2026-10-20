import { api } from "./client";

// Users
export async function listUsers() {
  const res = await api.get("/auth/users/");
  return res.data;
}

export async function createUser(payload) {
  // payload: { email, first_name, last_name, password, role }
  const res = await api.post("/auth/users/", payload);
  return res.data;
}

// Courses
export async function createCourse(payload) {
  // payload: { code, title, description, credits, teacher_id, is_open }
  const res = await api.post("/courses/", payload);
  return res.data;
}

export async function deleteCourse(id) {
  await api.delete(`/courses/${id}/`);
}

// Announcements (site-wide)
export async function createSiteAnnouncement(payload) {
  // payload: { title, body } — course omitted → site-wide
  const res = await api.post("/announcements/", payload);
  return res.data;
}

export async function deleteAnnouncement(id) {
  await api.delete(`/announcements/${id}/`);
}