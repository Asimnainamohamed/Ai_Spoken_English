export function getAuthCallbackUrl() {
  return new URL("/auth/callback", window.location.origin).toString();
}
