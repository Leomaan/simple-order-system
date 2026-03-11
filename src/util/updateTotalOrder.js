import OrderItem from "../models/orderItem.js";
import Order from "../models/order.js";

export async function updateTotal(orderId) {
  const items = await OrderItem.findAll({ where: orderId });
  const total = items.reduce((sum, item) => {
    return sum + item.totalPrice;
  }, 0);

  await Order.update({ total: total }, { where: { id: orderId } });
}
