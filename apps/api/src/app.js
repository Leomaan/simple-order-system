import e from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import corsOptions from './config/cors.js';

import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { httpLogger } from './middleware/httpLogger.js';
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
import settingsRoutes from './routes/settingsRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = e();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Swagger UI interactive testing
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://validator.swagger.io", "https://via.placeholder.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(httpLogger);

app.use(cookieParser());
app.use(csrfProtection);
app.use(e.json());

if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true
    }
  }));
}

app.use('/health', healthRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/order-item', orderItemRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/audit', auditLogRoutes);
app.use('/report', reportRoutes);
app.use('/payment', paymentRoutes);
app.use('/settings', settingsRoutes);

app.use(errorHandler);

export default app;