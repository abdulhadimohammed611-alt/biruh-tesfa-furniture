import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit3, ShieldAlert, Upload, X, Check, Eye, EyeOff } from 'lucide-react';

const ManageGallery = () => {
  const { token } = useAuth();

  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [titleEn, setTitleEn] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAm, setDescAm] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchGallery = () => {
    fetch('http://localhost:5000/api/gallery?all=true', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setGalleryItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setTitleEn('');
    setTitleAm('');
    setDescEn('');
    setDescAm('');
    setImageUrl('');
    setSortOrder('0');
    setIsPublished(true);
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditId(item.id);
    setTitleEn(item.title_en);
    setTitleAm(item.title_am);
    setDescEn(item.description_en || '');
    setDescAm(item.description_am || '');
    setImageUrl(item.image_url);
    setSortOrder((item.sort_order || 0).toString());
    setIsPublished(item.is_published === undefined ? true : item.is_published);
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
      const response = await fetch('http://localhost:5000/api/upload', {
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

    if (!imageUrl) {
      setErrorMsg('Image file upload or URL link is required.');
      return;
    }

    const payload = {
      title_en: titleEn,
      title_am: titleAm,
      description_en: descEn,
      description_am: descAm,
      image_url: imageUrl,
      sort_order: parseInt(sortOrder || 0),
      is_published: isPublished
    };

    try {
      const url = editId 
        ? `http://localhost:5000/api/gallery/${editId}` 
        : 'http://localhost:5000/api/gallery';
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
        setSuccessMsg(editId ? 'Gallery item updated successfully.' : 'Gallery item posted successfully.');
        fetchGallery();
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setErrorMsg(data.message || 'Saving failed.');
      }
    } catch (err) {
      setErrorMsg('Network error saving gallery item.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchGallery();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">Manage Gallery</h1>
          <p className="text-xs text-stone-500 font-light">Add, edit, or remove showroom and customer layout designs.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn-primary !py-2.5 !px-5 text-sm flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Gallery Post</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading gallery items...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl border ${
                item.is_published ? 'border-stone-200/50' : 'border-red-200 bg-red-50/10'
              } shadow-2xs overflow-hidden flex flex-col justify-between`}
            >
              
              <div className="h-48 relative overflow-hidden bg-stone-100">
                <img src={item.image_url} alt={item.title_en} className="w-full h-full object-cover" />
                
                {/* Status indicator overlay */}
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  {item.is_published ? (
                    <>
                      <Eye className="h-3 w-3 text-green-400" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 text-red-400" />
                      <span>Draft</span>
                    </>
                  )}
                </div>

                <div className="absolute top-3 right-3 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Sort: {item.sort_order || 0}
                </div>
              </div>

              <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 leading-tight">{item.title_en}</h4>
                  <p className="text-[10px] text-stone-400 italic">{item.title_am}</p>
                  <p className="text-[11px] text-stone-500 font-light line-clamp-2 leading-relaxed">{item.description_en}</p>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 btn-outline !py-1.5 text-xs flex items-center justify-center space-x-1 hover:bg-stone-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-lg text-stone-950 font-display">
                {editId ? 'Edit Gallery Post Details' : 'Create Gallery Post'}
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
              
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Title (English)</label>
                  <input
                    required
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Bole Showroom Setup"
                    className="w-full border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Title (Amharic)</label>
                  <input
                    required
                    type="text"
                    value={titleAm}
                    onChange={(e) => setTitleAm(e.target.value)}
                    placeholder="e.g. የቦሌ ሾውሩም እቃዎች አቀማመጥ"
                    className="w-full border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Description (English)</label>
                  <textarea
                    rows="3"
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50 focus:outline-none"
                  ></textarea>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Description (Amharic)</label>
                  <textarea
                    rows="3"
                    value={descAm}
                    onChange={(e) => setDescAm(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 bg-stone-50 focus:outline-none"
                  ></textarea>
                </div>
              </div>

              {/* Sorting and Publishing Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500">Display Sorting Order</label>
                  <input
                    required
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:outline-none"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-6 sm:pt-4">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-5 w-5 text-primary-500 focus:ring-primary-400 border-stone-300 rounded"
                  />
                  <label htmlFor="isPublished" className="text-xs font-bold text-stone-700 cursor-pointer">
                    Publish immediately (Visible in Showcase)
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 block">Image Photo</label>
                
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
                    <span className="text-[10px] text-stone-400 font-bold mt-1">Upload Photo</span>
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
                  {editId ? 'Save Changes' : 'Post to Gallery'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageGallery;
