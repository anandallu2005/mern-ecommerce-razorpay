const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Create new order (before payment)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  let itemsPrice = 0;
  const orderItems = [];

  for (const i of items) {
    const product = await Product.findById(i.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${i.product}`);
    }
    if (product.stock < i.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} left.`);
    }

    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsPrice += effectivePrice * i.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || "",
      price: effectivePrice,
      quantity: i.quantity,
    });
  }

  const shippingPrice = itemsPrice > 999 ? 0 : 49;
  const taxPrice = Number((itemsPrice * 0.18).toFixed(2)); // GST 18%
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    statusHistory: [{ status: "pending", note: "Order created, awaiting payment" }],
  });

  res.status(201).json(order);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get single order by id (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json(order);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status - order tracking (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.statusHistory.push({ status, note });

  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  // Restore stock if order is cancelled after payment
  if (status === "cancelled" && order.isPaid) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }
  }

  const updated = await order.save();
  res.json(updated);
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
