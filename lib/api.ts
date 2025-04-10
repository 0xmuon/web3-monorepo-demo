const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://co3pe.onrender.com/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

export async function proxyRequest(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  console.log('Making request to:', url); // Debug log

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Proxy request error:', error);
    throw error;
  }
} 