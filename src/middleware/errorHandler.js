export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'internal server error';
  return res.status(status).json({ success: false, message });
}