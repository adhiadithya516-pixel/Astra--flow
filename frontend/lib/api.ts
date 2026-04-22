const getApiBase = () => {
  return process.env.NEXT_PUBLIC_API_URL || "/api";
};

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${endpoint}`);
  if (!res.ok) {
    let msg = "API GET failed";
    try {
      const errData = await res.json();
      msg = errData.detail || errData.message || msg;
    } catch {
      try {
        msg = await res.text() || msg;
      } catch {}
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  
  const url = `${getApiBase()}${endpoint}`;
  const res = await fetch(url, options);
  
  console.log('Response status:', res.status, res.statusText);
  if (!res.ok) {
    const errBody = await res.text();
    console.error('Response body:', errBody);
    throw new Error(`HTTP ${res.status}: ${errBody}`);
  }
  return res.json();
}
