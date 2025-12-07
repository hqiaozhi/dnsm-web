let tokenExpired = false

export function isTokenExpired(): boolean {
  return tokenExpired
}

export function setTokenExpired(expired: boolean): void {
  tokenExpired = expired
}
