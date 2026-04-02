import API from "../api/axios";

export const getMyApplications = () => API.get("/internship/student");

export const createApplication = (data) => API.post("/internship/create", data);

export const updateApplication = (data) => API.put("/internship/student", data);

export const deleteApplication = (id) => API.delete(`/internship/${id}`);

export const uploadProof = (internshipId, file) => {
  const formData = new FormData();
  formData.append("internshipId", internshipId);
  formData.append("documentType", "proofOfApplication");
  formData.append("document", file);
  return API.post("/internship/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const getApplicationProgress = (studentId) => API.get(`/progress/student/${studentId}`);

