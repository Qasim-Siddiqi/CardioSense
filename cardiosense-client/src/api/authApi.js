import api from "./axios";

/**
 * Register a new patient account.
 * @param {{ fullName: string, email: string, password: string }} data
 * @returns {{ token: string, role: string, fullName: string }}
 */
export async function register(data) {
  const response = await api.post("/auth/register", data);
  return response.data; // { token, role, fullName }
}

/**
 * Log in with existing credentials.
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, role: string, fullName: string }}
 */
export async function login(data) {
  const response = await api.post("/auth/login", data);
  return response.data; // { token, role, fullName }
}
