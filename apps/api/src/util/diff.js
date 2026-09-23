export function calculateDiff(oldObj = {}, newObj = {}, fields = null) {
  const diff = {};
  if (!oldObj || !newObj) return diff;

  const keysToCheck = fields || Object.keys(newObj);

  for (const key of keysToCheck) {
    if (newObj[key] === undefined) continue;

    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Float / Number precision comparison
    if (typeof oldVal === 'number' && typeof newVal === 'number') {
      if (Math.abs(oldVal - newVal) > 0.0001) {
        diff[key] = { old: oldVal, new: newVal };
      }
      continue;
    }

    // General comparison
    if (oldVal !== newVal) {
      diff[key] = { old: oldVal, new: newVal };
    }
  }

  return diff;
}

export function formatQuantityDiff(oldQty, newQty) {
  const diff = Number(newQty) - Number(oldQty);
  return diff > 0 ? `+${diff}` : `${diff}`;
}
