# ShopMERN — Full-Stack E-commerce App (MERN + Razorpay)

A complete e-commerce application with customer storefront, cart, Razorpay checkout,
order tracking, and an admin dashboard (analytics, inventory management, order management).

## Tech Stack
- **Frontend:** React 18 + Vite, React Router, Recharts (charts), Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Payments:** Razorpay (test mode)

## Features
- Product catalog with search, category filter, pagination
- Cart (persisted in localStorage) → Checkout → Razorpay payment → payment verification
- Order tracking with status history (pending → processing → shipped → delivered / cancelled)
- Admin dashboard: revenue, orders-by-status, 30-day sales chart, top-selling products
- Inventory management: low-stock & out-of-stock views, manual stock adjustment (restock/reduce)
- Product CRUD (admin), category creation
- JWT-based auth with customer/admin roles

---

## 1. Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) OR a free MongoDB Atlas cluster
- A free Razorpay account (test mode) → https://dashboard.razorpay.com/signup
  - Get your **Key ID** and **Key Secret** from Settings → API Keys (use Test Mode keys)

## 2. Backend Setup

```bash
cd backend
npm install
copy .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Open `.env` and fill in:
```
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_mern
JWT_SECRET=some_long_random_string
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
```

Seed the database with an admin user, categories, and sample products:
```bash
npm run seed
```
This creates an admin login: **admin@example.com / admin123**

Start the backend:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`. Visit `http://localhost:5000` to confirm "API is running...".

## 3. Frontend Setup

Open a **new terminal**:
```bash
cd frontend
npm install
copy .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```
Frontend runs at `http://localhost:5173`.

## 4. Test the Full Flow
1. Go to `http://localhost:5173`, browse products, add to cart.
2. Register a new customer account (or use it directly).
3. Go to Cart → Checkout → fill address → "Pay with Razorpay".
4. Use Razorpay **test card**: `4111 1111 1111 1111`, any future expiry, any CVV, any name.
5. After payment, you're redirected to "My Orders" — you'll see the order marked Paid with a status timeline.
6. Log in as admin (`admin@example.com` / `admin123`) → go to `/admin`:
   - **Dashboard**: revenue, order counts, 30-day chart, top products
   - **Products**: create/edit/deactivate products
   - **Inventory**: see low-stock/out-of-stock items, restock or reduce quantities
   - **Orders**: update order status (pending → processing → shipped → delivered), which customers see live in "My Orders"

## 5. Folder Structure
```
ecommerce-mern/
├── backend/
│   ├── config/db.js
│   ├── controllers/       # auth, product, order, payment, admin logic
│   ├── middleware/        # auth (JWT), admin role check, error handler
│   ├── models/            # User, Product, Category, Order (Mongoose schemas)
│   ├── routes/
│   ├── utils/              # generateToken.js, seed.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js    # axios instance with auth interceptor
        ├── context/        # AuthContext, CartContext
        ├── components/     # Navbar, ProductCard, ProtectedRoute
        ├── pages/           # Home, ProductDetail, Cart, Checkout, Login, Register, MyOrders
        └── pages/admin/     # AdminDashboard, AdminProducts, AdminInventory, AdminOrders
```

## 6. Deployment Notes
- **Backend:** Render / Railway / Cyclic — set env vars from `.env`, use MongoDB Atlas for `MONGO_URI`.
- **Frontend:** Vercel / Netlify — set `VITE_API_URL` to your deployed backend URL + `/api`.
- Switch Razorpay to **Live Mode** keys only after KYC is approved; test mode keys work fine for demos/interviews.
- Update `CLIENT_URL` in backend `.env` to your deployed frontend URL (for CORS).

## 7. Resume Talking Points (why this project is strong)
- Real payment gateway integration with signature verification (security — HMAC SHA256), not just a "fake" checkout.
- Proper inventory management: stock decremented only after **payment confirmation**, restored on cancellation.
- Order lifecycle with audit trail (`statusHistory`) — mirrors how real e-commerce backends work.
- Admin analytics using MongoDB aggregation pipelines (revenue by day, top products).
- Role-based access control (JWT + admin middleware) rather than a single generic user type.
