import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";


/**
 * Generic REST API utility for React Native (NO COOKIES)
 *
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - FULL API URL (must include protocol e.g. https://)
 * @param {object|FormData|null} data - Request payload
 * @param {object} options - Optional settings
 */
export const Restapi = async (method, url, data = null, options = {}) => {
  const {
    customHeaders = {},
    queryParams = {},
    timeout = 10000,
    retries = 0,
  } = options;

  // ✅ Default headers
  const headers = {
    Accept: "application/json",
    ...customHeaders,
  };

  // ✅ Set JSON Content-Type (except for FormData)
  const isFormData = data instanceof FormData;
  if (!isFormData && method.toUpperCase() !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  // ✅ Add Bearer token if exists (but skip for login/signup)
  const token = await AsyncStorage.getItem("accessToken");
  const isAuthFreeEndpoint =
    url.includes("/login") || url.includes("/signin") || url.includes("/signup");

  if (token && !isAuthFreeEndpoint) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ✅ Handle query params for GET requests
  let requestUrl = url;
  if (method.toUpperCase() === "GET" && Object.keys(queryParams).length > 0) {
    const queryString = new URLSearchParams(queryParams).toString();
    requestUrl += (requestUrl.includes("?") ? "&" : "?") + queryString;
  }

  // ✅ Prepare fetch config
  const config = {
    method: method.toUpperCase(),
    headers,
  };
  if (data && method.toUpperCase() !== "GET") {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  // --- Timeout + Retry logic ---
  const attemptFetch = async (attempt = 0) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(requestUrl, config);
      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      const responseData = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        };
      }

      if (!Array.isArray(responseData?.message) &&  responseData?.status === "error") {
        console.log('empty error', responseData)
        Toast.show({type: 'error',text1: responseData.message || responseData.details || "Server Error" });
}

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      // 🔁 Retry logic
      if (error.name === "AbortError") {
        throw { status: 408, statusText: "Request Timeout" };
      }

      if (attempt < retries) {
        console.warn(`Retrying request... attempt ${attempt + 1}`);
        return attemptFetch(attempt + 1);
      }

      // 🚫 Handle expired JWT
      if (error.status === 403) {
        await AsyncStorage.removeItem("accessToken");
        router.replace("/signin_signup");
      }

      // console.error("Request failed:", error);
      // Alert.alert(error.message || error.details || "server Error");
      throw error;
    }
  };

  return attemptFetch();
};
