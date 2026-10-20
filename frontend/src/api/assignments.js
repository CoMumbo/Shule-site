import { api } from "./client";

export async function listAssignments(params = {}) {
  const res = await api.get("/assignments/", { params });
  return res.data;
}

export async function createAssignment(formData) {
  const res = await api.post("/assignments/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteAssignment(id) {
  await api.delete(`/assignments/${id}/`);
}