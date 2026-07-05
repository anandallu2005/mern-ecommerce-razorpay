const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getAllUsers,
  createCategory,
  getCategories,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

router.get("/categories", getCategories); // public read
router.post("/categories", protect, admin, createCategory);

router.get("/dashboard", protect, admin, getDashboardStats);
router.get("/sales-chart", protect, admin, getSalesChart);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/users", protect, admin, getAllUsers);

module.exports = router;
