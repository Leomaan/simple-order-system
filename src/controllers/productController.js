import Product from "../models/product.js";

export async function create(req, res) {
    const name = req.body.name;

    try{
        const productExists = await Product.findOne({where:{name:name}})

        if(productExists){
            return res.status(400).json({message: 'Product already exists'})
        }
            const product = await Product.create(req.body);
            res.status(201).json(product);
        }catch(error){
            res.status(500).json({error: 'error'})
    }
}

export async function getAll(req, res) {
  const products = await Product.findAll();
  res.json(products);
}

export async function getById(req, res){
    const id = req.params.id;
    const product = await Product.findByPk(id);

    if(!product){
        return res.status(404).json({message:'product not found'})
    }
        return res.status(200).json(product)  
}

export async function remove(req, res) {
  const id = req.params.id;
  const removed = await Product.destroy({ where: { id: id } });

  if (!removed) {
    return res.status(404).json({ message: "error" });
  }
  return res.status(201).json({message:'product removed'})
}

export async function update(req, res) {
    const id = req.params.id;  
    try{
        const product = await Product.findByPk(id);

        if(!product){
            return res.status(404).json({message: 'product not found'});
        }
        await product.update(req.body);
        return res.status(200).json(product);

    }catch(error){
        return res.status(500).json({error: 'error'})
    }
    
    
}
