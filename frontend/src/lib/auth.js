const STORAGE_KEY = 'prospectus_api_password';

export function getApiPassword() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setApiPassword(password) {
  sessionStorage.setItem(STORAGE_KEY, password);
}

export function clearApiPassword() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn() {
  return Boolean(getApiPassword());
}
