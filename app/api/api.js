// api.js
// utils/api.js
// import { Alert, Platform } from 'react-native';
export const fetchData = async (endpoint, method = 'GET', body = null, headers = {}) => {
  try {
    const baseUrl = 'https://bringesse.com:3003/api/';
    const url = `${baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    });
    console.log('Status:', response.status);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error.message);
    throw error;
  }
};

