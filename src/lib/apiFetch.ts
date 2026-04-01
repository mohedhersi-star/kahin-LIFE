export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  const options = init || {};
  if (url.startsWith('/api/')) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${localStorage.getItem('isLoggedIn') === 'true' ? 'authenticated' : ''}`
    };
  }
  
  const response = await fetch(input, options);
  
  return response;
}
