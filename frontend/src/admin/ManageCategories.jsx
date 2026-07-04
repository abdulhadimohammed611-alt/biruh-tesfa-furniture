import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Trash2, Edit3, FolderOpen, Upload, X, Check, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

const ManageCategories = () => {
  const { token } = useAuth();
  const { lang } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${API_URL}/api/categories?all=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setNameEn('');
    setNameAm('');
    setImageUrl('');
    setSortOrder('0');
    setIsActive(true);
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditId(cat.id);
    setNameEn(cat.name_en);
    setNameAm(cat.name_am);
    setImageUrl(cat.image_url || '');
    setSortOrder(cat.sort_order.toString());
    setIsActive(cat.is_active);
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
        setImageUrl(data.url);
      } else {
        setErrorMsg(data.message || 'Image upload failed.');
      }
    } catch (err) {
      setErrorMsg('Network error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      name_en: nameEn,
      name_am: nameAm,
      image_url: imageUrl,
      sort_order: parseInt(sortOrder),
      is_active: isActive
    };

    try {
      const url = editId 
        ? `${API_URL}/api/categories/${editId}` 
        : `${API_URL}/api/categories`;
      const method = editId ? 'PUT' : 'POST';

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
        setSuccessMsg(editId ? 'Category updated successfully.' : 'Category created successfully.');
        fetchCategories();
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setErrorMsg(data.message || 'Operation failed.');
      }
    } catch (err) {
      setErrorMsg('Network error saving category.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    setErrorMsg('');
    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        fetchCategories();
      } else {
        alert(data.message || 'Delete operation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting category.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">Manage Categories</h1>
          <p className="text-xs text-stone-500 font-light">Organize, sort, and enable/disable product catalog categories.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn-primary !py-2.5 !px-5 text-sm flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid Listing */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading categories registry...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className={`bg-white rounded-2xl border ${
                cat.is_active ? 'border-stone-200/50' : 'border-red-200 bg-red-50/10'
              } shadow-2xs overflow-hidden flex flex-col justify-between`}
            >
              <div className="h-40 relative overflow-hidden bg-stone-100">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name_en} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <FolderOpen className="h-12 w-12" />
                  </div>
                )}
                
                {/* Active Indicator overlay */}
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  {cat.is_active ? (
                    <>
                      <Eye className="h-3 w-3 text-green-400" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 text-red-400" />
                      <span>Inactive</span>
                    </>
                  )}
                </div>

                <div className="absolute top-3 right-3 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Sort: {cat.sort_order}
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 leading-tight">{cat.name_en}</h4>
                  <p className="text-[11px] text-stone-400 font-medium italic">{cat.name_am}</p>
                  <p className="text-[10px] text-stone-500 font-mono">Slug: {cat.slug}</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="flex-1 btn-outline !py-1.5 text-xs flex items-center justify-center space-x-1 hover:bg-stone-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name_en)}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Creation/Editing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-lg text-stone-950 font-display">
                {editId ? 'Edit Category Parameters' : 'Create New Category'}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Name (English)</label>
                  <input
                    required
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Office Furniture"
                    className="w-full border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Name (Amharic)</label>
                  <input
                    required
                    type="text"
                    value={nameAm}
                    onChange={(e) => setNameAm(e.target.value)}
                    placeholder="e.g. የቢሮ ዕቃዎች"
                    className="w-full border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sorting order and Activation status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Sorting Display Order</label>
                  <input
                    required
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="0"
                    className="w-full border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:outline-none"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-6 sm:pt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 text-primary-500 focus:ring-primary-400 border-stone-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-stone-700 cursor-pointer">
                    Enable Activation Status (Publish)
                  </label>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 block">Category Image Banner</label>
                
                {imageUrl ? (
                  <div className="relative w-40 h-32 rounded-xl overflow-hidden border border-stone-200 shadow-2xs">
                    <img src={imageUrl} alt="Upload result" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 rounded-2xl border-2 border-dashed border-stone-300 hover:border-primary-500 bg-stone-50 flex flex-col justify-center items-center cursor-pointer transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 text-stone-400" />
                    <span className="text-[10px] text-stone-400 font-bold mt-1">Upload Photo Banner</span>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                        <span className="text-xs text-primary-500 font-bold animate-pulse">Uploading file...</span>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline !py-2 !px-4 text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-4 text-[10px]"
                >
                  {editId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageCategories;
