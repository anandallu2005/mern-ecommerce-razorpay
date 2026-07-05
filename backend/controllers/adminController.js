const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");

// @desc    Dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalRevenueAgg = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  const totalOrders = await Order.countDocuments();
  const paidOrders = await Order.countDocuments({ isPaid: true });
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalUsers = await User.countDocuments({ role: "customer" });
  const totalCategories = await Category.countDocuments();

  const pendingOrders = await Order.countDocuments({ status: "pending" });
  const processingOrders = await Order.countDocuments({ status: "processing" });
  const shippedOrders = await Order.countDocuments({ status: "shipped" });
  const deliveredOrders = await Order.countDocuments({ status: "delivered" });
  const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

  const lowStockCount = await Product.countDocuments({
    stock: { $gt: 0 },
    isActive: true,
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  });
  const outOfStockCount = await Product.countDocuments({ stock: 0, isActive: true });

  res.json({
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    totalOrders,
    paidOrders,
    totalProducts,
    totalUsers,
    totalCategories,
    ordersByStatus: {
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    lowStockCount,
    outOfStockCount,
  });
});

// @desc    Sales data grouped by day (last 30 days) for charts
// @route   GET /api/admin/sales-chart
// @access  Private/Admin
const getSalesChart = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const salesData = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(salesData);
});

// @desc    Top selling products
// @route   GET /api/admin/top-products
// @access  Private/Admin
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ sold: -1 })
    .limit(10)
    .select("name sold stock price images");
  res.json(products);
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Create category (admin)
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
  const exists = await Category.findOne({ slug });
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }
  const category = await Category.create({ name, slug });
  res.status(201).json(category);
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

module.exports = {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getAllUsers,
  createCategory,
  getCategories,
};
