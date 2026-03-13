import Product from "../models/product.js";

export async function create(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "no data provided" });
    }

    const productExists = await Product.findOne({ where: { name } });
    if (productExists) {
      return res.status(400).json({ success: false, message: "product already exists" });
    }

    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "error" });
  }
}

export async function getAll(req, res) {
  try {
    const products = await Product.findAll();
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    return res.status(500).json({ success: false, message: "error" });
  }
}

export async function getById(req, res) {
  try {
    const id = req.params.id;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    const removed = await Product.destroy({ where: { id } });

    if (!removed) {
      return res.status(404).json({ success: false, message: "product not found" });
    }
    return res.status(200).json({ success: true, message: "product removed" });
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

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "product not found" });
    }

    await product.update(req.body);
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}
