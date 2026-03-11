import OrderItem from "../models/orderItem.js";
import Product from "../models/product.js";
import { updateTotal } from "../util/updateTotalOrder.js";

export async function create(req, res) {
  const { orderId, productId, quantity } = req.body;

  const product = await Product.findByPk(productId);

  const orderItem = await OrderItem.create({
    orderId,
    productId,
    quantity,
    unitPrice: product.price,
    totalPrice: product.price * quantity
  });

  await updateTotal(orderId);

  res.status(201).json(orderItem);
}