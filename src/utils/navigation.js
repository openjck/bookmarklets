export function at(url) {
  return document.URL.includes(url);
}

export function navigate(url) {
  window.location.href = url;
}
