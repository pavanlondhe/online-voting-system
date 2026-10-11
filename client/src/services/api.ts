const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('mahavote_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
          const refreshToken = localStorage.getItem('mahavote_refresh_token');
          if (refreshToken) {
            const refreshed = await this.refreshToken(refreshToken);
            if (refreshed) {
              // Retry request with new token
              return this.request<T>(endpoint, options);
            }
          }
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Network error or server unreachable');
    }
  }

  private async refreshToken(refreshToken: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        localStorage.setItem('mahavote_access_token', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('mahavote_refresh_token', data.data.refreshToken);
        }
        return true;
      }
    } catch {
      // Failed to refresh
    }
    localStorage.removeItem('mahavote_access_token');
    localStorage.removeItem('mahavote_refresh_token');
    return false;
  }

  // HTTP Methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
