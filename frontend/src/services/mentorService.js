import API from "../api/axios";

export const getMentorProfile = () => {
  return API.get("/mentor/profile");
};

export const createMentorProfile = (data) => {
  return API.post("/mentor/profile", data);
};

export const updateMentorProfile = (data) => {
  return API.put("/mentor/profile", data);
};

export const uploadDocument = (formData) => {
  return API.post("/mentor/documents", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadResource = (formData) => {
  return API.post("/mentor/resources", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getSchedule = () => {
  return API.get("/mentor/schedule");
};

export const updateSchedule = (data) => {
  return API.put("/mentor/schedule", data);
};
