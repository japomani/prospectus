const STORAGE_KEY = 'prospectus_api_password';
const ADMIN_KEY = 'prospectus_is_admin';

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
  sessionStorage.removeItem(ADMIN_KEY);
}

export function isLoggedIn() {
  return Boolean(getApiPassword());
}

export function setIsAdmin(isAdmin) {
  try {
    if (isAdmin) sessionStorage.setItem(ADMIN_KEY, '1');
    else sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}

export function isAdminSession() {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === '1';
  } catch {
    return false;
  }
}
