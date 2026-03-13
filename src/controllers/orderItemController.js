import Order from "../models/order.js";
import OrderItem from "../models/orderItem.js";
import Product from "../models/product.js";

export async function create(req, res) {
  try {
    const { orderId, productId, quantity } = req.body;

    if (!orderId || !productId || !quantity) {
      return res.status(400).json({ success: false, message: "no data provided" });
    }

    const product = await Product.findByPk(productId);
    const order = await Order.findByPk(orderId);

    if (!order || !product) {
      return res.status(404).json({ success: false, message: "order or product not found" });
    }

    if (!product.available) {
      return res.status(400).json({ success: false, message: "product not available" });
    }

    if (order.status !== "OPEN") {
      return res.status(400).json({ success: false, message: "order is not open." });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "invalid quantity" });
    }

    const exists = await OrderItem.findOne({
      where: { OrderId: orderId, ProductId: productId },
    });

    if (exists) {
      await exists.update({
        quantity: exists.quantity + quantity,
        totalPrice: product.price * (exists.quantity + quantity),
      });
      return res.status(200).json({ success: true, data: exists });
    }

    const orderItem = await OrderItem.create({
      OrderId: orderId,
      ProductId: productId,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    });

    return res.status(201).json({ success: true, data: orderItem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "internal server error" });
  }

}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    const removed = await OrderItem.destroy({ where: { id } });

    if (!removed) {
      return res.status(404).json({ success: false, message: "order item not found" });
    }
    return res.status(200).json({ success: true, message: "order item removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}