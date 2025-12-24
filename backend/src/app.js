import express from "express";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import productRoutes from "./routes/product.route.js";


import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || "http://localhost:5173",
    credentials: true,
  })
);

// Webhook route MUST be registered before express.json() middleware
// because Stripe requires raw body for signature verification
app.use("/api/orders/webhook", orderRoutes);

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

// Other routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
// app.use('/api/auth', authRoutes);

app.use(errorHandler);
export default app;
