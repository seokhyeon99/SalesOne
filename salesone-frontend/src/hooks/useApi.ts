import { useState } from 'react';

interface RequestOptions extends RequestInit {
  body?: any;
}

interface ApiError extends Error {
  status?: number;
  data?: any;
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      // Add default headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Handle request body
      if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }

      // Make the request
      const response = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include', // Important for sending cookies
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = new Error(
          errorData.detail || errorData.non_field_errors?.[0] || '요청 처리 중 오류가 발생했습니다.'
        );
        error.status = response.status;
        error.data = errorData;

        // If we get a 401 Unauthorized and we're not already on the login page,
        // we should redirect to login in our auth context
        if (response.status === 401 && !window.location.pathname.startsWith('/login')) {
          console.error('Authentication error, will be redirected by AuthContext');
        }

        throw error;
      }

      // Parse JSON response if there is content, return empty object for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API request error:', error);
      const message = error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    makeRequest,
    isLoading,
    error,
  };
} 