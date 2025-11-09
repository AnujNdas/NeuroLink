import axios from "axios";

const API = axios.create({
  baseURL: "https://neurolink-backend.onrender.com/api/auth", // change to your backend URL if deployed
});

// Signup user
export const signupUser = async (userData) => {
  const res = await API.post("/signup", userData);
  return res.data;
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  const res = await API.post("/verify-otp", { email, otp });
  return res.data;
};

// Login user
export const loginUser = async (userData) => {
  const res = await API.post("/login", userData);
  return res.data;
};
