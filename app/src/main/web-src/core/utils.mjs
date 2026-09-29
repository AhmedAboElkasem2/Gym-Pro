export const clone = (value) => JSON.parse(JSON.stringify(value));
export const uid = () => Math.random().toString(36).slice(2, 10);
export const normalize = (value = '') => value.trim().toLowerCase().replace(/\s+/g, ' ');
export const escapeHtml = (value) => String(value ?? '').replace(
  /[&<>"']/g,
  (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])
);
