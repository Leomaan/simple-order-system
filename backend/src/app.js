import e from 'express';
import productRoutes from './routes/produtctRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import orderItemRoutes from './routes/orderItemRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditLogRoutes from './routes/auditlogsRoutes.js';

const app = e();

app.use(e.json());

app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/order-item', orderItemRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/audit', auditLogRoutes);

app.use(errorHandler);

export default app;