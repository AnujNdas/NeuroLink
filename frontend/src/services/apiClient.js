import axios from "axios";

// Auto-detect whether you're running locally or in production
const isLocalhost = window.location.origin.includes("localhost");

// Use the correct backend depending on environment
const BASE_URL = isLocalhost
  ? "http://localhost:5000/api" // your local backend
  : "https://neurolink-backend.onrender.com/api"; // your deployed backend

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // keep this if you're using cookies or auth sessions
});

export default API;
