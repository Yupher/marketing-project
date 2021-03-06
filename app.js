const express = require("express");
const tryRouter = require("./routers/tryRouter");
const authRouter = require("./routers/authRouter");
const categoryRouter = require("./routers/categoryRouter");
const reviewRouter = require("./routers/reviewRoute");
const couponRouter = require("./routers/couponRoute");
const productRouter = require("./routers/productRoute");
const orderRouter = require("./routers/orderRouter");
const cartRouter = require("./routers/cartRouter");
const wishListRoute = require("./routers/wishListRoute");
const subscriptionRoute = require("./routers/subscriptionRoute");
const userRoute = require("./routers/userRoute");
const globalErrorHandler = require("./controllers/errorController");
const appError = require("./utils/appError");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "10kb" }));

// 3) ROUTES

app.use("/api/v1/category", categoryRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/try", tryRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishlist", wishListRoute);
app.use("/api/v1/subscription", subscriptionRoute);
app.use("/api/v1/user", userRoute);

app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
