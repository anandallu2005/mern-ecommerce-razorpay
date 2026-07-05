const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getInventoryStatus,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

router.get("/admin/inventory", protect, admin, getInventoryStatus);

router.get("/", getProducts);
router.post("/", protect, admin, createProduct);
router.get("/:id", getProductById);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.put("/:id/stock", protect, admin, adjustStock);

module.exports = router;
