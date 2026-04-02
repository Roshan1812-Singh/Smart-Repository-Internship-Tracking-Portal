import API from "../api/axios";

export const addStudent = (data) => {
  return API.post("/students/add", data);
};

export const getStudents = () => {
  return API.get("/students");
};

export const getTasks = () => {
  return API.get("/students/tasks");
};

export const submitReport = (formData) => {
  return API.post("/students/reports", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
