const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Category = require("../models/Category");

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  const categoryFilter = req.query.category ? { category: req.query.category } : {};

  const priceFilter = {};
  if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
  const price = Object.keys(priceFilter).length ? { price: priceFilter } : {};

  const filter = { isActive: true, ...keyword, ...categoryFilter, ...price };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort(req.query.sort === "price_asc" ? { price: 1 } : req.query.sort === "price_desc" ? { price: -1 } : { createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPrice, category, images, stock, lowStockThreshold, sku } = req.body;

  if (!name || !description || !price || !category) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error("Invalid category");
  }

  const product = await Product.create({
    name,
    description,
    price,
    discountPrice: discountPrice || 0,
    category,
    images: images || [],
    stock: stock || 0,
    lowStockThreshold: lowStockThreshold || 5,
    sku,
    createdBy: req.user._id,
  });

  res.status(201).json(product);
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = ["name", "description", "price", "discountPrice", "category", "images", "stock", "lowStockThreshold", "sku", "isActive"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete product (admin) - soft delete
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.isActive = false;
  await product.save();
  res.json({ message: "Product removed" });
});

// @desc    Adjust stock manually (admin) - inventory management
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
const adjustStock = asyncHandler(async (req, res) => {
  const { adjustment, reason } = req.body; // adjustment can be positive or negative
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const newStock = product.stock + Number(adjustment);
  if (newStock < 0) {
    res.status(400);
    throw new Error("Stock cannot go below zero");
  }

  product.stock = newStock;
  await product.save();

  res.json({ message: `Stock updated (${reason || "manual adjustment"})`, product });
});

// @desc    Get low-stock / out-of-stock products (admin)
// @route   GET /api/products/admin/inventory
// @access  Private/Admin
const getInventoryStatus = asyncHandler(async (req, res) => {
  const outOfStock = await Product.find({ stock: 0, isActive: true }).select("name stock sku");
  const lowStock = await Product.find({
    stock: { $gt: 0 },
    isActive: true,
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  }).select("name stock lowStockThreshold sku");

  res.json({ outOfStock, lowStock });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getInventoryStatus,
};
