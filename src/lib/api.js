import { readJSON, writeJSON } from './storage.js';

const SESSION_KEY = 'ca-session';

export const getSession = () => readJSON(SESSION_KEY, null);
export const setSession = (session) => writeJSON(SESSION_KEY, session);

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  const token = getSession()?.token;
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', 0);
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('ca:session-expired'));
    throw new ApiError(data.error ?? 'Algo salió mal. Inténtalo de nuevo.', response.status, data.fields);
  }
  return data;
}
