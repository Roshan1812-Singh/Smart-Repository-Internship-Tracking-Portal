import API from "../api/axios";

export const addProgress = (data) => {
  return API.post("/progress/add", data);
};

export const getStudentProgress = (studentId) => {
  return API.get(`/progress/student/${studentId}`);
};

export const updateProgress = (id, data) => {
  return API.put(`/progress/update/${id}`, data);
};