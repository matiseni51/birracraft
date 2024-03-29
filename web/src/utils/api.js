const BASE_URL = "http://localhost:8680/api";

export const API_AUTH_CALL = async (username, password) => {
  const url = `${BASE_URL}/auth/token/`;
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  const body = JSON.stringify({ username, password });
  const params = { method: `POST`, headers, body };
  const response = await fetch(url, params);
  const tokens = await response.json();
  if (response.status === 200) {
    window.localStorage.setItem("authTokens", JSON.stringify(tokens));
    window.localStorage.setItem("authUser", body);
  }
  return response;
};

export const API_AUTH_REFRESH_CALL = async (authTokens) => {
  const url = `${BASE_URL}/auth/token/refresh/`;
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  const params = {
    method: `POST`,
    headers,
    body: JSON.stringify({ refresh: authTokens.refresh }),
  };
  const response = await fetch(url, params);
  if (response.status !== 200) {
    alert("Session expired");
    window.location.replace("/SignIn");
  } else {
    const tokens = await response.json();
    window.localStorage.setItem("authTokens", JSON.stringify(tokens));
    return tokens;
  }
};

export const API_DATA_CALL = async (method, endpoint, data = null) => {
  const authTokens = JSON.parse(window.localStorage.getItem("authTokens"));
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${authTokens?.access}`,
  });
  const body = data ? JSON.stringify(data) : null;
  const params = { method: `${method}`, headers, body };
  const response = await fetch(url, params);
  if (response.statusText === "Unauthorized") {
    const authRefreshTokens = await API_AUTH_REFRESH_CALL(authTokens);
    headers.set("Authorization", `Bearer ${authRefreshTokens?.access}`);
    const params = { method: `${method}`, headers, body };
    const response = await fetch(url, params);
    const data = await response.json();
    return data;
  }

  return response.json();
};

export const API_NOAUTH_CALL = async (endpoint, user_data) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user_data),
  });
  return response;
};
