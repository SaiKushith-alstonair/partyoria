export async function apiRequest(url: string, options: any) {
  return fetch(url, options);
}