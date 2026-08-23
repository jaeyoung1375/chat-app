// src/utils/api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiResponse<T> {
  code: string;
  data: T;
  message: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // API 기본 URL
  timeout: 5000, // 5초 타임아웃
  withCredentials: true, // 쿠키(refreshToken) 자동 첨부
});

// accessToken은 메모리에만 보관 (새로고침 시 사라지므로 /auth/refresh로 재발급)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse<ApiResponse<unknown>>) => {
    const { code, data, message } = res.data;

    if (code !== "0000") {
      return Promise.reject({ code, data, message });
    }

    return res;
  },
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;

    if (
      status === 401 &&
      !url?.includes("/auth/login") &&
      !url?.includes("/auth/refresh")
    ) {
      // 토큰은 쿠키로만 관리하므로 세션 만료 여부를 프론트에서 판별할 수 없음 -> 홈으로 리다이렉트
      window.location.href = "/";
      return new Promise(() => {});
    }

    return Promise.reject(err);
  },
);

// GET 요청
export const get = async <T>(url: string, config?: AxiosRequestConfig) => {
  const res = await api.get<ApiResponse<T>>(url, config);

  return res.data.data;
};

// POST 요청
export const post = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => {
  const res = await api.post<ApiResponse<T>>(url, body, config);

  const { code, message, data } = res.data;

  return { code, message, data };
};

// POST 요청
export const postForm = async <T>(
  url: string,
  body?: FormData,
  config?: AxiosRequestConfig,
) => {
  const res = await api.postForm<ApiResponse<T>>(url, body, config);

  const { code, message, data } = res.data;

  return { code, message, data };
};

// DELETE 요청
export const deleteData = async <T>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  const res = await api.delete<ApiResponse<T>>(url, config);

  const { code, data } = res.data;

  return { code, data };
};

// PATCH 요청
export const patch = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => {
  const res = await api.patch<ApiResponse<T>>(url, body, config);

  const { code, message, data } = res.data;

  return { code, message, data };
};

// PUT 요청
export const put = async <T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => {
  const res = await api.put<ApiResponse<T>>(url, body, config);

  const { code, message, data } = res.data;

  return { code, message, data };
};

export default api;
