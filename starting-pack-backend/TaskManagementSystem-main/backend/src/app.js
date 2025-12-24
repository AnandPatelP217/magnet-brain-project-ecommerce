import express from "express";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import productRoutes from "./routes/product.route.js";


import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Stripe webhook route MUST be before express.json() to receive raw body
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.app.locals.webhookRawBody = req.body;
  next();
});

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ["http://localhost:5174", "http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
// app.use('/api/auth', authRoutes);

app.use(errorHandler);
export default app;
