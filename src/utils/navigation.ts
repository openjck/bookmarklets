export function atBaseUrl(url: string): boolean {
  return document.URL.startsWith(url);
}

export function navigate(url: string): void {
  window.location.href = url;
}
