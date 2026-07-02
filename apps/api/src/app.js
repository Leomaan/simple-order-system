import e from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { swaggerSpec } from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { csrfProtection } from './middleware/csrf.js';

import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import orderItemRoutes from './routes/orderItemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditLogRoutes from './routes/auditlogsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = e();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(generalLimiter);

app.use(cookieParser());
app.use(csrfProtection);
app.use(e.json());

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