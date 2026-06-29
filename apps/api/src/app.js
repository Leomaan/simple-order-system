import e from 'express';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import orderItemRoutes from './routes/orderItemRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditLogRoutes from './routes/auditlogsRoutes.js';
import { swaggerSpec } from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import reportRoutes from './routes/reportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cors from 'cors';

const app = e();

app.use(cookieParser());
app.use(e.json());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/order-item', orderItemRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/audit', auditLogRoutes);
app.use('/report', reportRoutes);
app.use('/payment', paymentRoutes);

app.use(errorHandler);

export default app;