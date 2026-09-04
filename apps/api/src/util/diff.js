
/**
 * Calculates the difference between two objects for specified fields.
 * Returns a diff map: { [field]: { old: oldValue, new: newValue } }
 *
 * @param {Object} oldObj - The original object or values
 * @param {Object} newObj - The new object or values
 * @param {string[]} [fields] - List of fields to monitor. If omitted, compares all keys present in newObj.
 * @returns {Record<string, { old: any, new: any }>} Object containing only the modified properties
 */
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

/**
 * Formata a diferença numérica de quantidade com sinal (+X ou -X).
 *
 * @param {number} oldQty
 * @param {number} newQty
 * @returns {string} Ex: "+1", "-2", "0"
 */
export function formatQuantityDiff(oldQty, newQty) {
  const diff = Number(newQty) - Number(oldQty);
  return diff > 0 ? `+${diff}` : `${diff}`;
}
