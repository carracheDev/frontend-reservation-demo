export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/backend";

export function apiUrl(path: string) {
  return `${API_URL.replace(/\/$/, "")}${path}`;
}