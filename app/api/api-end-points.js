const BASE_URL = 'https://bringesse.com:3003/api/';
export const API_BASE_URL = `${BASE_URL}`;

/* ******  Authentication APIs Start ****** */
const APP_HOME_PAGE_API = {
  url: `${API_BASE_URL}/app-home-page`,
  method: 'POST',
  responseDataKey: 'data',
};
// APP_REGISTER_LOGIN_API_CALL
const APP_REGISTER_LOGIN_API = {
  url: `${API_BASE_URL}/signin`,
  method: 'POST',
  responseDataKey: 'data',
};

// APP_GET_REVENUE_API
const APP_GET_REVENUE_API = {
  url: `${API_BASE_URL}/getrevenue`,
  method: 'POST',
  responseDataKey: 'data',
};
// https://bringesse.com:3003/api/appdefaults
// APP_SITE_SETTING_API
const APP_SITE_SETTING_API = {
  url: `${API_BASE_URL}/appdefaults`,
  method: 'GET',
  responseDataKey: 'data',
};

// APP_REGISTER_API
const APP_REGISTER_API = {
  url: `${API_BASE_URL}/signup`,
  method: 'POST',
  responseDataKey: '',
};


// APP_REGISTER_API
const APP_REGISTER_OTP_LOGIN_API = {
  url: `${API_BASE_URL}/sendotp`,
  method: 'POST',
  responseDataKey: '',
};

export const API_REQUESTS = {
  APP_HOME_PAGE_API,
  APP_REGISTER_LOGIN_API,APP_GET_REVENUE_API,
  APP_SITE_SETTING_API,APP_REGISTER_API,APP_REGISTER_OTP_LOGIN_API
};
