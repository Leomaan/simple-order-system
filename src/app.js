import e from "express";
import productRoutes from "./routes/produtctRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import orderItemRoutes from "./routes/orderItemRoutes.js"

const app = e();

app.use(e.json());

app.use('/product', productRoutes)
app.use('/order', orderRoutes)
app.use('/order-item', orderItemRoutes)

export default app;

