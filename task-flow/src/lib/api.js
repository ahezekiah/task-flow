export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5050"
).replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, path, body) {
  const token = getToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody = body;

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method,
      headers,
      body: requestBody
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Request failed"
    );

    error.status = response.status;

    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) =>
    request("POST", path, body),
  put: (path, body) =>
    request("PUT", path, body),
  patch: (path, body) =>
    request("PATCH", path, body),
  delete: (path, body) =>
    request("DELETE", path, body)
};