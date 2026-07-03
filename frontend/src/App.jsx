import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Lighting from './pages/Lighting';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';

// Admin Pages
import Dashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import ManageOrders from './admin/ManageOrders';
import ManageUsers from './admin/ManageUsers';
import ManageGallery from './admin/ManageGallery';
import ManageCategories from './admin/ManageCategories';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                
                {/* Router-conditional Layout: Hide standard nav/footer on admin pages */}
                <Routes>
                  {/* Admin Route Group */}
                  <Route path="/admin/*" element={
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<ManageProducts />} />
                        <Route path="/orders" element={<ManageOrders />} />
                        <Route path="/users" element={<ManageUsers />} />
                        <Route path="/gallery" element={<ManageGallery />} />
                        <Route path="/categories" element={<ManageCategories />} />
                      </Routes>
                    </AdminLayout>
                  } />

                  {/* Public Storefront Route Group */}
                  <Route path="*" element={
                    <>
                      <Navbar />
                      <div className="flex-grow">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:id" element={<ProductDetail />} />
                          <Route path="/lighting" element={<Lighting />} />
                          <Route path="/gallery" element={<Gallery />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </div>
                      <Footer />
                    </>
                  } />
                </Routes>

              </div>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
