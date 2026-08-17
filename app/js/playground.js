/* Playground behaviour: dialogs, uploads and a slow background job. */

document.addEventListener('DOMContentLoaded', () => {
  const result = document.querySelector('[data-testid="dialog-result"]');

  document.querySelector('[data-testid="alert-button"]').addEventListener('click', () => {
    alert('Your session will expire in 5 minutes.');
    result.textContent = 'Alert acknowledged';
  });

  document.querySelector('[data-testid="confirm-button"]').addEventListener('click', () => {
    const accepted = confirm('Delete this item from your wishlist?');
    result.textContent = accepted ? 'Item deleted' : 'Deletion cancelled';
  });

  document.querySelector('[data-testid="prompt-button"]').addEventListener('click', () => {
    const name = prompt('What should we call you?', '');
    result.textContent = name ? `Hello, ${name}!` : 'No name given';
  });

  document.querySelector('[data-testid="file-input"]').addEventListener('change', (event) => {
    const file = event.target.files[0];
    document.querySelector('[data-testid="upload-result"]').textContent = file
      ? `Uploaded: ${file.name} (${file.size} bytes)`
      : 'No file selected';
  });

  document.querySelector('[data-testid="start-job"]').addEventListener('click', () => {
    const status = document.querySelector('[data-testid="job-status"]');
    status.textContent = 'Running...';
    setTimeout(() => {
      status.textContent = 'Job completed';
    }, 2000);
  });
});
