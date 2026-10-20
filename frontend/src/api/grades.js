import { api } from "./client";

export async function listGrades(params = {}) {
  const res = await api.get("/grades/", { params });
  return res.data;
}

export async function createGrade(payload) {
  const res = await api.post("/grades/", payload);
  return res.data;
}

export async function updateGrade(id, payload) {
  const res = await api.patch(`/grades/${id}/`, payload);
  return res.data;
}