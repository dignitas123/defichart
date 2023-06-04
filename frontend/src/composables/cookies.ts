export function useCookies() {
  function setCookie(name: string, value: string, expireDays = 15) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expireDays); // Set the cookie expiration to 7 days from now

    document.cookie = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
  }

  function getCookie(name: string) {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        const cookieValue = cookie.substring(name.length + 1);
        return cookieValue;
      }
    }

    return null;
  }

  return {
    setCookie,
    getCookie,
  };
}
