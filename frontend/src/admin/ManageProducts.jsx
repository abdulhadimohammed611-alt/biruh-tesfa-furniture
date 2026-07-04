import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Edit2, Trash2, ShieldAlert, Upload, X, Check } from 'lucide-react';
import { API_URL } from '../config';

const ManageProducts = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAm, setDescAm] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [priceEtb, setPriceEtb] = useState('');
  const [category, setCategory] = useState('sofas');
  const [subCategory, setSubCategory] = useState('');
  const [stock, setStock] = useState(10);
  const [dimEn, setDimEn] = useState('');
  const [dimAm, setDimAm] = useState('');
  const [featEn, setFeatEn] = useState('');
  const [featAm, setFeatAm] = useState('');
  const [images, setImages] = useState([]);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch(`${API_URL}/api/categories?all=true`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
      })
      .catch(err => console.error("Error fetching categories:", err));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setNameEn('');
    setNameAm('');
    setDescEn('');
    setDescAm('');
    setPriceUsd('');
    setPriceEtb('');
    setCategory(categories.length > 0 ? categories[0].slug : 'sofas');
    setSubCategory('');
    setStock(10);
    setDimEn('');
    setDimAm('');
    setFeatEn('');
    setFeatAm('');
    setImages([]);
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setNameEn(prod.name_en);
    setNameAm(prod.name_am);
    setDescEn(prod.description_en);
    setDescAm(prod.description_am);
    setPriceUsd(prod.price_usd);
    setPriceEtb(prod.price_etb);
    setCategory(prod.category);
    setSubCategory(prod.sub_category || '');
    setStock(prod.stock);
    setDimEn(prod.dimensions_en || '');
    setDimAm(prod.dimensions_am || '');
    setFeatEn(prod.features_en?.join(', ') || '');
    setFeatAm(prod.features_am?.join(', ') || '');
    setImages(prod.images || []);
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setImages([...images, data.url]);
      } else {
        setErrorMsg(data.message || 'Image upload failed.');
      }
    } catch (err) {
      setErrorMsg('Network error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (images.length === 0) {
      setErrorMsg('At least one product image is required.');
      return;
    }

    const payload = {
      name_en: nameEn,
      name_am: nameAm,
      description_en: descEn,
      description_am: descAm,
      price_usd: parseFloat(priceUsd),
      price_etb: parseFloat(priceEtb),
      category,
      sub_category: subCategory || null,
      stock: parseInt(stock),
      dimensions_en: dimEn || null,
      dimensions_am: dimAm || null,
      features_en: featEn ? featEn.split(',').map(s => s.trim()) : [],
      features_am: featAm ? featAm.split(',').map(s => s.trim()) : [],
      images
    };

    const url = editingProduct 
      ? `${API_URL}/api/products/${editingProduct.id}` 
      : `${API_URL}/api/products`;
    
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(editingProduct ? 'Product updated successfully.' : 'Product created successfully.');
        fetchProducts();
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setErrorMsg(data.message || 'Saving product failed.');
      }
    } catch (err) {
      setErrorMsg('Network error saving product.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is irreversible.')) return;

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">Manage Products</h1>
          <p className="text-xs text-stone-500 font-light">Inventory control and item registration panel.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn-primary !py-2.5 !px-5 text-sm flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-stone-200/50 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-stone-500">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-400 uppercase border-b border-stone-200/50">
                  <th className="p-4">Image</th>
                  <th className="p-4">Product details (EN/AM)</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Price (USD)</th>
                  <th className="p-4 text-right">Price (ETB)</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="text-stone-700 hover:bg-stone-50/50">
                    <td className="p-4 shrink-0">
                      <img src={prod.images[0]} alt={prod.name_en} className="w-12 h-12 object-cover rounded-lg bg-stone-100" />
                    </td>
                    <td className="p-4 space-y-1 max-w-xs">
                      <p className="font-bold text-stone-900 truncate">{prod.name_en}</p>
                      <p className="text-stone-400 italic truncate">{prod.name_am}</p>
                    </td>
                    <td className="p-4 capitalize font-medium">{prod.category}</td>
                    <td className="p-4 text-right font-bold">{formatPrice(prod.price_usd, 0, 'en')}</td>
                    <td className="p-4 text-right font-bold">{formatPrice(0, prod.price_etb, 'en')}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.stock > 3 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {prod.stock} left
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-lg text-stone-950 font-display">
                {editingProduct ? 'Edit Product details' : 'Register New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-stone-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-500 rounded-xl border border-red-200 text-xs font-semibold flex items-center space-x-1.5">
                <ShieldAlert className="h-4.5 w-4.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-200 text-xs font-semibold flex items-center space-x-1.5">
                <Check className="h-4.5 w-4.5 animate-bounce" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Name (English)</label>
                  <input
                    required
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Royal Canopy Bed"
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Name (Amharic)</label>
                  <input
                    required
                    type="text"
                    value={nameAm}
                    onChange={(e) => setNameAm(e.target.value)}
                    placeholder="e.g. ኪንግ ሳይዝ ሮያል አልጋ"
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Description (English)</label>
                  <textarea
                    required
                    rows="3"
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50 focus:outline-none"
                  ></textarea>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Description (Amharic)</label>
                  <textarea
                    required
                    rows="3"
                    value={descAm}
                    onChange={(e) => setDescAm(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50 focus:outline-none"
                  ></textarea>
                </div>
              </div>

              {/* Prices, stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Price (USD)</label>
                  <input
                    required
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Price (ETB)</label>
                  <input
                    required
                    type="number"
                    value={priceEtb}
                    onChange={(e) => setPriceEtb(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Stock Units</label>
                  <input
                    required
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name_en} / {cat.name_am}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Sub-category (e.g. ceiling, wall, led for lighting)</label>
                  <input
                    type="text"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Dimensions (EN)</label>
                  <input
                    type="text"
                    value={dimEn}
                    onChange={(e) => setDimEn(e.target.value)}
                    placeholder="e.g. 200cm x 180cm x 40cm"
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Dimensions (AM)</label>
                  <input
                    type="text"
                    value={dimAm}
                    onChange={(e) => setDimAm(e.target.value)}
                    placeholder="e.g. 200ሴሜ x 180ሴሜ x 40ሴሜ"
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Features EN (comma separated)</label>
                  <input
                    type="text"
                    value={featEn}
                    onChange={(e) => setFeatEn(e.target.value)}
                    placeholder="Foam, Solid Oak, Steel Legs"
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Features AM (comma separated)</label>
                  <input
                    type="text"
                    value={featAm}
                    onChange={(e) => setFeatAm(e.target.value)}
                    placeholder="አረፋ, ጠንካራ የኦክ እንጨት, የብረት እግሮች"
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50"
                  />
                </div>
              </div>

              {/* Images uploads */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 block">Product Images</label>
                
                <div className="flex flex-wrap gap-2.5">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-150 border border-stone-200 shadow-2xs">
                      <img src={img} alt="Product file" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload button wrapper */}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 hover:border-primary-500 bg-stone-50 flex flex-col justify-center items-center cursor-pointer transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-5 w-5 text-stone-400" />
                    <span className="text-[9px] text-stone-400 font-semibold mt-1">Upload</span>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                        <span className="text-[10px] text-primary-500 font-semibold animate-pulse">Loading...</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline !py-2 !px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-4 text-xs flex items-center space-x-1"
                >
                  <span>Save Product</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageProducts;
