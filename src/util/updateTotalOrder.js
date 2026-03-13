export function updateTotal(orderItems) { 
  return orderItems.reduce((sum, item) => {
    return sum + Number(item.totalPrice);
  }, 0);
}