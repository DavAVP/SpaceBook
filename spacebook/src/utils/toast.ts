export type ToastType = 'success' | 'error' | 'info';

export function showToast(message: string, type: ToastType = 'info', timeout = 3500) {
  try {
    const id = `sb-toast-${Date.now()}`;
    const containerId = 'sb-toast-container';

    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'sb-toast-container';
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.id = id;
    el.className = `sb-toast sb-toast-${type}`;
    el.textContent = message;

    container.appendChild(el);

    // trigger reflow for animation
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetWidth;
    el.classList.add('sb-toast-show');

    setTimeout(() => {
      el.classList.remove('sb-toast-show');
      el.classList.add('sb-toast-hide');
      setTimeout(() => el.remove(), 400);
    }, timeout);
  } catch (e) {
    // fallback: console
    // eslint-disable-next-line no-console
    console.error('Toast render failed:', e);
  }
}

export default showToast;
