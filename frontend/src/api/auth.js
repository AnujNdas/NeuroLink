import API from "./apiClient"; // adjust path if needed

// Signup user
export const signupUser = async (userData) => {
  const res = await API.post("/auth/signup", userData);
  return res.data;
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  const res = await API.post("/auth/verify-otp", { email, otp });
  return res.data;
};

// Login user
export const loginUser = async (userData) => {
  const res = await API.post("/auth/login", userData);
  return res.data;
};
