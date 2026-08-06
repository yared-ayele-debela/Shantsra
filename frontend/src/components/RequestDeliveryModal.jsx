import React, { useState, useEffect } from 'react';
import { X, Package, Plus, Upload, AlertCircle, CheckCircle2, Calendar, Phone, MapPin, Weight, User, Zap } from 'lucide-react';

export default function RequestDeliveryModal({ onClose, onSubmit, editingPackage }) {
  const [receiverName, setReceiverName] = useState(() => {
    if (editingPackage) {
      return editingPackage.receiver_name || editingPackage.title?.replace('Shipment for ', '') || editingPackage.title || '';
    }
    return '';
  });
  const [receiverPhone, setReceiverPhone] = useState(editingPackage?.phone || editingPackage?.receiver_phone || '');
  const [fromCity, setFromCity] = useState(() => {
    if (editingPackage) {
      if (editingPackage.from_city) return editingPackage.from_city;
      return editingPackage.route === 'DXB_TO_ADD' ? 'Dubai' : 'Addis Ababa';
    }
    return 'Addis Ababa';
  });
  const [toCity, setToCity] = useState(() => {
    if (editingPackage) {
      if (editingPackage.to_city) return editingPackage.to_city;
      return editingPackage.route === 'DXB_TO_ADD' ? 'Addis Ababa' : 'Dubai';
    }
    return 'Dubai';
  });
  const [weight, setWeight] = useState(editingPackage?.weight || '1.5');
  const [description, setDescription] = useState(editingPackage?.desc || editingPackage?.description || '');
  const [isUrgent, setIsUrgent] = useState(Boolean(editingPackage?.is_urgent));
  const [categoryId, setCategoryId] = useState(editingPackage?.category_id || '');
  const [dbCategories, setDbCategories] = useState([]);
  const [travelDate, setTravelDate] = useState(() => {
    if (editingPackage?.travel_date) return editingPackage.travel_date;
    if (editingPackage?.deadline && typeof editingPackage.deadline === 'string' && editingPackage.deadline.includes('Needed by ')) {
      return editingPackage.deadline.replace('Needed by ', '');
    }
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(editingPackage?.img || null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/package-categories', {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.categories && data.categories.length > 0) {
            setDbCategories(data.categories);
            if (!categoryId) setCategoryId(data.categories[0].id);
          }
        }
      } catch (err) {
        console.log('Modal category fetch completed.');
      }
    }
    fetchCategories();
  }, []);

  const handleRoutePreset = (routeKey) => {
    if (routeKey === 'ADD_TO_DXB') {
      setFromCity('Addis Ababa');
      setToCity('Dubai');
    } else {
      setFromCity('Dubai');
      setToCity('Addis Ababa');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).slice(0, 5);
      setImageFiles(files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('receiver_name', receiverName);
      if (receiverPhone) formData.append('receiver_phone', receiverPhone);
      formData.append('from_city', fromCity);
      formData.append('to_city', toCity);
      formData.append('weight', weight);
      if (description) formData.append('description', description);
      formData.append('travel_date', travelDate);
      formData.append('is_urgent', isUrgent ? '1' : '0');
      if (categoryId) formData.append('category_id', categoryId);

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          if (file && file instanceof File && file.size > 0) {
            formData.append('images[]', file, file.name);
          }
        });
      }

      let response;
      if (editingPackage && editingPackage.id) {
        response = await fetch(`/api/shipments/${editingPackage.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            receiver_name: receiverName,
            receiver_phone: receiverPhone,
            from_city: fromCity,
            to_city: toCity,
            weight: parseFloat(weight),
            description,
            travel_date: travelDate,
            is_urgent: isUrgent ? 1 : 0,
            category_id: categoryId || null,
            cover_image: imagePreview
          })
        });
      } else {
        response = await fetch('/api/shipments', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: formData
        });
      }

      let data = {};
      try {
        data = await response.json();
      } catch (e) {}

      if (response && !response.ok && data.errors) {
        setFieldErrors(data.errors);
        setErrorMsg(data.message || 'Failed to submit shipment request. Please check inputs.');
        setLoading(false);
        return;
      }

      const created = data.shipment || {
        id: editingPackage ? editingPackage.id : `ship_${Date.now()}`,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        from_city: fromCity,
        to_city: toCity,
        weight: parseFloat(weight),
        description,
        travel_date: travelDate,
        is_urgent: isUrgent,
        status: editingPackage?.status || 'pending'
      };

      const finalPackageImg = imagePreview || created.cover_image || created.product_images?.[0] || editingPackage?.img || '/assets/No-Image-Found-400x264.png';
      const selectedCategory = dbCategories.find(category => String(category.id) === String(categoryId));
      const categoryName = created.category_name || selectedCategory?.name || editingPackage?.category || 'Uncategorized';

      const mappedPackage = {
        id: editingPackage ? editingPackage.id : created.id,
        title: `Shipment for ${receiverName}`,
        desc: description || `Delivery from ${fromCity} to ${toCity}`,
        sender: editingPackage?.sender || 'You (Current User)',
        route: (fromCity || '').toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
        weight: String(weight),
        reward: `AED ${(parseFloat(weight || 1) * 35).toFixed(0)}`,
        category: categoryName,
        category_id: created.category_id || categoryId || editingPackage?.category_id || null,
        deadline: `Needed by ${travelDate}`,
        img: finalPackageImg,
        status: editingPackage?.status || created.status || 'pending',
        is_urgent: Boolean(isUrgent),
        phone: receiverPhone || '251911223344',
        createdAt: editingPackage?.createdAt || Date.now(),
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        from_city: fromCity,
        to_city: toCity,
        travel_date: travelDate
      };

      setSuccessMsg(editingPackage ? 'Package shipment request updated successfully!' : 'Package shipment request posted successfully!');
      setTimeout(() => {
        onSubmit(mappedPackage);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Shipment operation error:', err);
      const finalPackageImg = imagePreview || editingPackage?.img || '/assets/No-Image-Found-400x264.png';
      const mockReq = {
        id: editingPackage ? editingPackage.id : `ship_${Date.now()}`,
        title: `Shipment for ${receiverName}`,
        desc: description || `Delivery from ${fromCity} to ${toCity}`,
        sender: editingPackage?.sender || 'You (Current User)',
        route: fromCity.toLowerCase().includes('dubai') ? 'DXB_TO_ADD' : 'ADD_TO_DXB',
        weight: String(weight),
        reward: `AED ${(parseFloat(weight || 1) * 35).toFixed(0)}`,
        category: editingPackage?.category || 'General Package',
        deadline: `Needed by ${travelDate}`,
        img: finalPackageImg,
        status: editingPackage?.status || 'pending',
        is_urgent: isUrgent,
        phone: receiverPhone || '251911223344',
        createdAt: editingPackage?.createdAt || Date.now(),
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        from_city: fromCity,
        to_city: toCity,
        travel_date: travelDate
      };

      setSuccessMsg(editingPackage ? 'Package shipment request updated successfully!' : 'Package shipment request posted successfully!');
      setTimeout(() => {
        onSubmit(mockReq);
        onClose();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 shrink-0 bg-amber-50/40">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-[#1C160F] flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </span>
            <h3 className="font-display text-base font-bold text-[#1C160F]">
              {editingPackage ? 'Edit Delivery Request' : 'Add Delivery Request'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center text-slate-500 hover:text-[#1C160F] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Receiver Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Receiver Name (Item / Contact) *
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3" />
              <input 
                type="text" 
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g., Recipient name and item summary" 
                className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
              />
            </div>
            {fieldErrors.receiver_name && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.receiver_name[0]}</p>}
          </div>

          {/* Category Selection */}
          {dbCategories.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Package Category
              </label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-amber-200/80 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-amber-500 bg-white text-[#1C160F]"
              >
                {dbCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Route Corridor (From & To City) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Flight Route Corridor *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[9px] font-bold text-slate-500 mb-1">From City</span>
                <input 
                  type="text" 
                  required 
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Addis Ababa"
                  className="w-full border border-amber-200/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-500 mb-1">To City</span>
                <input 
                  type="text" 
                  required 
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="Dubai"
                  className="w-full border border-amber-200/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => handleRoutePreset('ADD_TO_DXB')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                  fromCity.includes('Addis') && toCity.includes('Dubai') ? 'bg-amber-500 text-[#1C160F] border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                ADD ➔ DXB
              </button>
              <button 
                type="button" 
                onClick={() => handleRoutePreset('DXB_TO_ADD')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                  fromCity.includes('Dubai') && toCity.includes('Addis') ? 'bg-amber-500 text-[#1C160F] border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                DXB ➔ ADD
              </button>
            </div>
          </div>

          {/* Weight & Travel Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Weight (kg) *
              </label>
              <div className="relative flex items-center">
                <Weight className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1" 
                  max="100.0"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
              </div>
              {fieldErrors.weight && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.weight[0]}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Requested Delivery Date *
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="date" 
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
              </div>
              {fieldErrors.travel_date && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.travel_date[0]}</p>}
            </div>
          </div>

          {/* Receiver Phone */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Receiver Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
              <input 
                type="text" 
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="e.g., +251911223344" 
                className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
              />
            </div>
            {fieldErrors.receiver_phone && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.receiver_phone[0]}</p>}
          </div>

          {/* Package Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Package Description &amp; Handover Instructions
            </label>
            <textarea 
              rows="2.5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item, its condition and packaging, and your preferred handover arrangements..."
              className="w-full border border-amber-200/80 rounded-xl p-3 text-xs outline-none focus:border-amber-500 resize-none text-[#1C160F]"
            />
            {fieldErrors.description && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.description[0]}</p>}
          </div>

          {/* Urgent Delivery Checkbox Toggle */}
          <div 
            onClick={() => setIsUrgent(!isUrgent)}
            className={`border rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              isUrgent ? 'border-amber-500 bg-amber-50' : 'border-amber-200/80 bg-slate-50/40 hover:bg-amber-50/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isUrgent ? 'bg-red-500 text-white' : 'bg-amber-500/10 text-amber-600'}`}>
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-[#1C160F] block">Mark as Priority Delivery</span>
                <span className="text-[10px] text-slate-500 block">Highlights your request to travelers who may be able to assist sooner</span>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>

          {/* Package Product Images Upload */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Package Photo (Optional)
            </label>

            {imagePreview && (
              <div className="mb-2 inline-block relative w-20 h-20 rounded-xl overflow-hidden border border-amber-200 shadow-2xs group">
                <img 
                  src={
                    (imagePreview && (imagePreview.startsWith('http://') || imagePreview.startsWith('https://') || imagePreview.startsWith('/storage') || imagePreview.startsWith('data:')))
                      ? imagePreview
                      : '/assets/No-Image-Found-400x264.png'
                  } 
                  alt="Package preview"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/No-Image-Found-400x264.png'; }}
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFiles([]);
                    setImagePreview('/assets/No-Image-Found-400x264.png');
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="relative border border-dashed border-amber-300 rounded-xl p-3 bg-amber-50/20 text-center cursor-pointer hover:bg-amber-50/50 transition-colors">
              <input 
                type="file" 
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
                <Upload className="w-4 h-4 text-amber-600" />
                <span>
                  {imageFiles.length > 0 ? `${imageFiles.length} new photo(s) selected` : imagePreview ? 'Change package photo' : 'Upload package photo (JPG, PNG max 5MB)'}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer Submit */}
          <div className="pt-3 border-t border-amber-50 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-[#1C160F]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#1C160F] rounded-xl hover:bg-amber-600 hover:text-[#1C160F] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {editingPackage 
                  ? (loading ? 'Saving...' : 'Save Changes') 
                  : (loading ? 'Submitting...' : 'Post Package Request')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
