import { api } from "./client";

export async function listSubmissions(params = {}) {
  const res = await api.get("/submissions/", { params });
  return res.data;
}

export async function createSubmission(formData) {
  const res = await api.post("/submissions/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}