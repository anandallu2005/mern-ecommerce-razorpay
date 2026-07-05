// Run with: npm run seed
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

dotenv.config();
connectDB();

const seed = async () => {
  try {
    await User.deleteMany({ role: "admin" });
    await Category.deleteMany();
    await Product.deleteMany();

    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    const categories = await Category.insertMany([
      { name: "Electronics", slug: "electronics" },
      { name: "Clothing", slug: "clothing" },
      { name: "Home & Kitchen", slug: "home-kitchen" },
    ]);

    await Product.insertMany([
      {
        name: "Wireless Headphones",
        description: "Noise-cancelling over-ear wireless headphones with 30hr battery life.",
        price: 2999,
        discountPrice: 2499,
        category: categories[0]._id,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"],
        stock: 25,
        lowStockThreshold: 5,
        sku: "ELEC-HP-001",
        createdBy: admin._id,
      },
      {
        name: "Smart Watch",
        description: "Fitness tracking smart watch with heart-rate monitor and AMOLED display.",
        price: 4999,
        discountPrice: 3999,
        category: categories[0]._id,
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
        stock: 4,
        lowStockThreshold: 5,
        sku: "ELEC-SW-002",
        createdBy: admin._id,
      },
      {
        name: "Cotton T-Shirt",
        description: "Premium 100% cotton crew-neck t-shirt, available in multiple colors.",
        price: 599,
        discountPrice: 0,
        category: categories[1]._id,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"],
        stock: 0,
        lowStockThreshold: 10,
        sku: "CLTH-TS-001",
        createdBy: admin._id,
      },
      {
        name: "Non-stick Cookware Set",
        description: "5-piece non-stick cookware set, induction compatible.",
        price: 3499,
        discountPrice: 2999,
        category: categories[2]._id,
        images: ["https://images.unsplash.com/photo-1584990347449-a8b3daf05eb2"],
        stock: 15,
        lowStockThreshold: 3,
        sku: "HOME-CK-001",
        createdBy: admin._id,
      },
    ]);

    console.log("Seed data inserted successfully!");
    console.log("Admin login -> email: admin@example.com | password: admin123");
    process.exit();
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seed();
