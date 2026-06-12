import API from "../api/axios";

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

export const forgotPassword = ({ email }) => {
  return API.post("/auth/forgot", { email });
};

export const resetPassword = (data) => {
  return API.post("/auth/reset", data);
};
