import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (path: string, options: any = {}) => {
  try {
    const { method = "GET", body, headers } = options;
    const response = await axios({
      url: `${API_URL}${path}`,
      method: method,
      data: body ? (typeof body === "string" ? JSON.parse(body) : body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 204) return null;
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || "An error occurred");
  }
};

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
