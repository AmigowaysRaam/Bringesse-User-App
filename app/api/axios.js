/**
 * This is axios interceptor which intercepts all the incoming and outgoing requests
 */
import axios from 'axios';
const request = axios;
// request.defaults.withCredentials = true;
request.interceptors.request.use(async config => {
  if (__DEV__) {
    console.log('Network_API_Request ===>', config);
  }
  return config;
});

request.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log('Network_API_Response ===>', response);
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.log('Network_API_ERR ===>', error);
    }
    // Handle your common errors here
    Promise.reject(error);
  },
);

export default request;
