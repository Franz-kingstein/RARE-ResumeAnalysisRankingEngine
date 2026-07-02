import axios, { AxiosError } from "axios";

const baseURL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  timeout: 60000, // 60 seconds (especially for embeddings generation)
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let message = "An unexpected error occurred.";
    if (error.response) {
      const data = error.response.data as any;
      message = data?.error || data?.message || `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      message = "Unable to connect to the server. Please verify the backend is running.";
    } else {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);
