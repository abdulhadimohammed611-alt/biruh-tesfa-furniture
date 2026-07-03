# BIRUH TESFA Furniture (ብሩህ ተስፋ ፈርኒቸር)

A premium, full-stack, mobile-first e-commerce web application for a real-world furniture and lighting business based in Addis Ababa, Ethiopia.

* **Slogan**: *"Brighten Your Home, Build Your Future."* (ቤትዎን ያብሩ፣ የወደፊት ሕይወትዎን ይገንቡ።)
* **Meaning**: Biruh Tesfa translates to *"Bright Hope"* or *"Light of Hope"* in Amharic.

---

## Technical Stack Overview

* **Frontend**: React (Vite) + Tailwind CSS v4 + React Router + i18next
* **Backend**: Node.js + Express API
* **Database**: PostgreSQL (UUID keys, relational tables, rating trigger transactions)
* **Authentication**: Stateless JSON Web Token (JWT) with cookie/headers verification
* **Payments Integration**:
  * **USD Currency**: Stripe payments (card validation simulation)
  * **ETB Currency**: Chapa gateway checkout initialization, Telebirr API setup, and manual Bank Transfer verification.
* **Storage**: Local static uploads (multer) with ready config fallbacks for Cloudinary.

---

## Repository Structure

```
BT/
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL database connection pool
│   │   ├── middleware/      # Auth security (JWT/Admin verification) and Multer file upload
│   │   ├── controllers/     # Business logic for Auth, Products, Reviews, Gallery, Orders
│   │   ├── routes/          # API route definitions
│   │   ├── db/              # schema.sql and seed.js (programmatic seeder)
│   │   └── app.js           # Server application startup
│   ├── uploads/             # Locally stored customer/admin uploaded images
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── locales/         # Translation dictionaries (English and Amharic)
│   ├── src/
│   │   ├── components/      # Navbar (with sliding Cart Drawer), Footer, and AdminLayout
│   │   ├── context/         # Auth, Cart, Language, Currency global React contexts
│   │   ├── pages/           # Storefront pages (Home, About, Products, ProductDetail, Lighting, Gallery, Contact, Checkout)
│   │   ├── admin/           # Admin controller pages (Dashboard, ManageProducts, ManageOrders, ManageUsers, ManageGallery)
│   │   ├── styles/          # custom stylesheets
│   │   ├── App.jsx          # Route router
│   │   └── main.jsx         # React bootstrapping (with i18n module)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── docker-compose.yml       # Local PostgreSQL Docker Container setup
└── README.md
```

---

## Local Setup & Quickstart

Follow these instructions to run the application on your local machine:

### 1. Database Setup (PostgreSQL)

You can run PostgreSQL locally using Docker Compose, or connect to your own PostgreSQL server.

**Option A: Using Docker Compose (Recommended)**
Open a terminal in the root directory and run:
```bash
docker-compose up -d
```
This starts a PostgreSQL instance listening on port `5432` with username `postgres`, password `password123`, and database name `biruh_tesfa_furniture`.

**Option B: Using local PostgreSQL installation**
1. Create a database named `biruh_tesfa_furniture` in your local database.
2. Edit the `.env` settings inside the `backend` folder to match your database login credentials (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).

---

### 2. Backend Server Setup & DB Seeding

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Verify `.env` properties (it is already pre-configured for standard Docker postgres settings).
3. Initialize the database schema and seed it with premium products:
   ```bash
   npm run seed
   ```
   *Note: This programmatically creates all tables, hashes default passwords, seeds the products, reviews, and gallery items.*
4. Start the Express API development server:
   ```bash
   npm run dev
   ```
   The backend API will run on: `http://localhost:5000`

---

### 3. Frontend App Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The frontend app will be accessible at: `http://localhost:5173`

---

## Default User Accounts for Testing

During database seeding, the following test accounts are registered:

1. **Administrator Account**:
   * **Email**: `admin@biruhtesfa.com`
   * **Password**: `admin123`
   * **Role**: Admin (Gives access to `/admin` dashboard metrics, order verification, inventory manager, user database, and gallery posts).

2. **Customer Account**:
   * **Email**: `abebe@example.com`
   * **Password**: `customer123`
   * **Role**: Customer (Standard shopping checkout access, order history, review submission).

---

## Key Features

1. **Multilingual (i18n)**: One-click toggle between **English** and **Amharic (አማርኛ)** across all layouts.
2. **Multi-currency**: Toggle between **ETB (Ethiopian Birr)** and **USD (US Dollar)**.
3. **Dedicated Lighting Showcase**: Highly customized dark-mode display to emphasize illumination products.
4. **Interactive Payment Verification**: When completing order checkouts using mock wallets (Chapa/Telebirr), the profile page displays an interactive **Sandbox Payment Callback** trigger button allowing developers to test order status transitions and inventory adjustments without requiring external live bank API endpoints.
