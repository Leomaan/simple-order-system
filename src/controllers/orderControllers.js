import Order from "../models/order.js";
import OrderItem from "../models/orderItem.js";
import Product from "../models/product.js";
import { updateTotal } from "../util/updateTotalOrder.js";

export async function create(req, res) {
  const table = req.body.table;

  try {
    const orderExists = await Order.findOne({ where: { table: table } });

    if (orderExists) {
      return res.status(400).json({ success: false, message: "order already exists" });
    }
    const order = await Order.create(req.body);
    return res.status(200).json({ success: true, data: {order} });
  } catch (error) {
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}

export async function getAll(req, res) {
  try {
    const orders = await Order.findAll();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}

export async function getById(req, res) {
  try {
    const id = req.params.id;
    const order = await Order.findByPk(id, {
      attributes: ["id", "table", "status"],
      include: [
        {
          model: OrderItem,
          attributes: ["quantity", "unitPrice", "totalPrice"],
          include: [
            {
              model: Product,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ sucess: true,  message: "order not found" });
    }
    const total = updateTotal(order.OrderItems);

    return res.status(200).json({ success: true, data: { ...order.toJSON(), total } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "internal server error",});
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    const removed = await Order.destroy({ where: { id: id } });

    if (!removed) {
      return res.status(404).json({ success: false, message: "order not found" });
    }
    return res.status(200).json({ success: true, message: "order removed" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "no data provided" });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "order not found" });
    }
    
    await order.update(req.body);
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}
