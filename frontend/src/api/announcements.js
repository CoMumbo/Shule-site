import { api } from "./client";

export async function listAnnouncements(params = {}) {
  const res = await api.get("/announcements/", { params });
  return res.data;
}

export async function createAnnouncement(payload) {
  const res = await api.post("/announcements/", payload);
  return res.data;
}