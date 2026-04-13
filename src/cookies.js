// Cookie helpers — setCookie/getCookie/deleteCookie
// Source: javascript.info/cookie
// All operations wrapped in try/catch — never throw.

export function setCookie(name, value, attributes = {}) {
  try {
    // Default path to '/' so cookie is accessible site-wide
    attributes = { path: '/', ...attributes };
    let cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    for (const key in attributes) {
      cookie += '; ' + key;
      if (attributes[key] !== true) {
        cookie += '=' + attributes[key];
      }
    }
    document.cookie = cookie;
  } catch (e) {
    // Silent — cookie operations should never crash the app
  }
}

export function getCookie(name) {
  try {
    // Escape regex special characters in cookie name before matching
    const escapedName = encodeURIComponent(name).replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
    const matches = document.cookie.match(
      new RegExp('(?:^|; )' + escapedName + '=([^;]*)')
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
  } catch (e) {
    return undefined;
  }
}

export function deleteCookie(name) {
  // Setting max-age=0 immediately expires the cookie
  setCookie(name, '', { 'max-age': 0, path: '/' });
}
