import { useRuntimeConfig } from '#app';

interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

export function useApiService() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;
  
   async function get(endpoint: string, options: RequestOptions = {}) {
    const token = useCookie('token').value;
    try {
      // Include any additional headers from options
      const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };
      
      // Build URL with query parameters if provided
      let url = `${baseUrl}${endpoint}`;
      if (options.params) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(options.params)) {
          queryParams.append(key, String(value));
        }
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      // Handle different response types
      switch (options.responseType) {
        case 'text':
          return response.text();
        case 'blob':
          return response.blob();
        case 'arraybuffer':
          return response.arrayBuffer();
        case 'json':
        default:
          return response.json();
      }
    } catch (error) {
      console.error(`GET ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  async function post(endpoint: string, data: any) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`POST ${endpoint} falhou:`, error);
      throw error;
    }
  }

  async function put(endpoint: string, data: any) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`PUT ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  async function del(endpoint: string) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      if (response.status === 204) {
        return null;
      }
      
      return response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  async function patch(endpoint: string, data: any) {
    const token = useCookie('token').value;
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`PATCH ${endpoint} falhou:`, error);
      throw error;
    }
  }
  
  return {
    get,
    post,
    put,
    delete: del, // Renomeado para 'del' como variável porque 'delete' é palavra reservada
    patch
  };
}