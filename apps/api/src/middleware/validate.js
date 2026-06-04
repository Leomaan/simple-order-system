export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = JSON.parse(result.error.message).map(e => e.message);
      return res.status(400).json({ success: false, message: messages });
    }

    req.body = result.data;
    next();
  };
}