/* Login page behaviour. */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-testid="login-form"]');
  const error = document.querySelector('[data-testid="login-error"]');
  const button = document.querySelector('[data-testid="login-button"]');

  const showError = (message) => {
    error.textContent = message;
    error.classList.remove('hidden');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.classList.add('hidden');

    const username = document.querySelector('[data-testid="username"]').value.trim();
    const password = document.querySelector('[data-testid="password"]').value;

    if (!username) return showError('Username is required.');
    if (!password) return showError('Password is required.');

    button.disabled = true;
    button.textContent = 'Signing in...';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Login failed.');
        return;
      }

      session.save({ username: data.username, token: data.token });
      location.href = '/inventory.html';
    } catch {
      showError('Network error. Please try again.');
    } finally {
      button.disabled = false;
      button.textContent = 'Log in';
    }
  });
});
