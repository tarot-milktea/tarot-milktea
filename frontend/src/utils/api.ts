const API_BASE_URL = 'https://j13a601.p.ssafy.io/api';

export interface ApiError {
  code: number;
  message: string;
  detail: string;
  timestamp: string;
}

export class ApiClientError extends Error {
  statusCode: number;
  apiError: ApiError;

  constructor(
    statusCode: number,
    apiError: ApiError,
    message?: string
  ) {
    super(message || apiError.message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

const createApiClient = () => {
  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let apiError: ApiError;
        try {
          apiError = await response.json();
        } catch {
          apiError = {
            code: response.status,
            message: response.statusText,
            detail: 'Unknown error occurred',
            timestamp: new Date().toISOString()
          };
        }
        throw new ApiClientError(response.status, apiError);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    get: <T>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),

    put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: 'DELETE' }),
  };
};

export const apiClient = createApiClient();