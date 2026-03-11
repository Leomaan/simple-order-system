import Order from "../models/order.js";

export async function create(req, res) {
    const table = req.body.table;

    try{
        const orderExists = await Order.findOne({where:{table:table}})

        if(orderExists){
            return res.status(400).json({message: 'order already exists'})
        }
            const order = await Order.create(req.body);
            res.status(201).json(order);
        }catch(error){
            res.status(500).json({error: 'error'})
    }
}

export async function getAll(req, res) {
  const orders = await Order.findAll();
  res.json(orders);
}

export async function getById(req, res){
    const id = req.params.id;
    const order = await Order.findByPk(id);

    if(!order){
        return res.status(404).json({message:'order not found'})
    }

        return res.status(200).json(order)  
}


export async function remove(req, res) {
  const id = req.params.id;
  const removed = await Order.destroy({ where: { id: id } });

  if (!removed) {
    return res.status(404).json({ message: "error" });
  }
  return res.status(201).json({message:'order removed'})
}

export async function update(req, res) {
    const id = req.params.id;  
    try{
        const order = await Order.findByPk(id);

        if(!order){
            return res.status(404).json({message: 'order not found'});
        }
        await order.update(req.body);
        return res.status(200).json(order);

    }catch(error){
        return res.status(500).json({error: 'error'})
    }
    
    
}
