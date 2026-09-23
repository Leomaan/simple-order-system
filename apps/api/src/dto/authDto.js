export function formatAuthDto({ role, name, csrfToken = null }) {
  return {
    role,
    name,
    csrfToken,
  };
}
