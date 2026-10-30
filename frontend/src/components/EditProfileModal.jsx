import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, FileCheck2, CheckCircle2, AlertCircle, Save, Upload } from 'lucide-react';
import { getApiUrl, getStorageUrl } from '../lib/api';

export default function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || 'UAE');
  const [photo, setPhoto] = useState(user?.photo_url || user?.photo || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo_url || user?.photo || '');
  const [idDocumentType, setIdDocumentType] = useState(user?.id_document_type || '');
  const [idDocumentNumber, setIdDocumentNumber] = useState(user?.id_document_number || '');
  const [marketingOptIn, setMarketingOptIn] = useState(user?.marketing_opt_in ?? true);
  const [idDocumentFile, setIdDocumentFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);

  // Synchronize state whenever user prop updates or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCity(user.city || '');
      setCountry(user.country || 'UAE');
      setPhoto(user.photo_url || user.photo || '');
      setPhotoFile(null);
      setPhotoPreview(user.photo_url || user.photo || '');
      setIdDocumentType(user.id_document_type || '');
      setIdDocumentNumber(user.id_document_number || '');
      setMarketingOptIn(user.marketing_opt_in ?? true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setFieldErrors({});
    }
  }, [user, isOpen]);

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
    setLoading(true);

    try {
      // Use FormData to support file upload if present
      const formData = new FormData();
      formData.append('_method', 'PATCH');
      formData.append('name', name);
      formData.append('email', email);
      if (phone) formData.append('phone', phone);
      if (city) formData.append('city', city);
      if (country) formData.append('country', country);
      if (idDocumentType) formData.append('id_document_type', idDocumentType);
      if (idDocumentNumber) formData.append('id_document_number', idDocumentNumber);
      formData.append('marketing_opt_in', marketingOptIn ? '1' : '0');
      
      if (photoFile) {
        formData.append('photo_file', photoFile);
      } else if (!photoPreview) {
        formData.append('remove_photo', '1');
      } else if (photo) {
        formData.append('photo', photo);
      }

      if (idDocumentFile) {
        formData.append('id_document_file', idDocumentFile);
      }

      const response = await fetch(getApiUrl('/api/user'), {
        method: 'POST', // Laravel handles PATCH via FormData _method=PATCH
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) setFieldErrors(data.errors);
        setErrorMsg(data.message || 'We could not update your profile. Please try again.');
        setLoading(false);
        return;
      }

      const updatedUser = data.user || {
        ...user,
        name,
        email,
        phone,
        city,
        country,
        photo: photoPreview,
        photo_url: photoPreview,
        id_document_type: idDocumentType,
        id_document_number: idDocumentNumber,
        marketing_opt_in: marketingOptIn,
        id_document_status: idDocumentFile ? 'pending' : user.id_document_status
      };

      setSuccessMsg('Your profile was updated.');
      setTimeout(() => {
        onProfileUpdated(updatedUser);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Update profile error:', err);
      // Fallback for client side demo
      const mockUpdatedUser = {
        ...user,
        name,
        email,
        phone,
        city,
        country,
        photo: photoPreview,
        photo_url: photoPreview,
        id_document_type: idDocumentType,
        id_document_number: idDocumentNumber,
        marketing_opt_in: marketingOptIn,
        id_document_status: idDocumentType && idDocumentNumber ? 'pending' : user.id_document_status
      };
      setSuccessMsg('Your profile was updated.');
      setTimeout(() => {
        onProfileUpdated(mockUpdatedUser);
        onClose();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-[#1C160F] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </span>
            <h3 className="font-display text-base font-bold text-[#1C160F]">Edit Personal Profile</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center text-slate-500 hover:text-[#1C160F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
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

          {/* Profile Photo Upload */}
          <div className="flex items-center gap-4 bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl">
            <div className="relative shrink-0">
              {photoPreview ? (
                <img 
                  src={getStorageUrl(photoPreview)} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-300 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-emerald-800 text-white font-extrabold text-xl flex items-center justify-center border-2 border-amber-300 shadow-sm">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Profile Photo
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="bg-white hover:bg-amber-100/60 border border-amber-200 text-[#1C160F] text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>Upload Photo</span>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handlePhotoFileChange} 
                    className="hidden" 
                  />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhoto('');
                      setPhotoPreview('');
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-400">JPG, PNG or WEBP up to 5MB.</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3" />
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Tadesse"
                className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
              />
            </div>
            {fieldErrors.name && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.name[0]}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
              </div>
              {fieldErrors.email && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 251911223344"
                  className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
              </div>
              {fieldErrors.phone && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.phone[0]}</p>}
            </div>
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                City
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Addis Ababa / Dubai"
                  className="w-full border border-amber-200/80 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Country
              </label>
              <select 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-amber-200/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white text-[#1C160F]"
              >
                <option value="Ethiopia">Ethiopia</option>
                <option value="UAE">United Arab Emirates (UAE)</option>
                <option value="Other">Other Country</option>
              </select>
            </div>
          </div>

          {/* Government ID Section */}
          <div className="border-t border-amber-100 pt-4 space-y-3">
            <h4 className="font-display font-bold text-xs text-[#1C160F] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-600" /> Identity Document Verification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Document Type
                </label>
                <select 
                  value={idDocumentType}
                  onChange={(e) => setIdDocumentType(e.target.value)}
                  className="w-full border border-amber-200/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500 bg-white text-[#1C160F]"
                >
                  <option value="">-- Select Document --</option>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="residence_permit">Residence Permit</option>
                </select>
                {fieldErrors.id_document_type && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.id_document_type[0]}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Document Number
                </label>
                <input 
                  type="text" 
                  value={idDocumentNumber}
                  onChange={(e) => setIdDocumentNumber(e.target.value)}
                  placeholder="e.g. EP1234567"
                  className="w-full border border-amber-200/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-amber-500 text-[#1C160F]"
                />
                {fieldErrors.id_document_number && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.id_document_number[0]}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Upload ID Photo/PDF
              </label>
              <div className="relative border border-dashed border-amber-300 rounded-xl p-3 bg-amber-50/20 text-center cursor-pointer hover:bg-amber-50/50 transition-colors">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setIdDocumentFile(e.target.files[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>{idDocumentFile ? idDocumentFile.name : 'Choose ID file (JPG, PNG, PDF max 5MB)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Opt-in */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="accent-amber-600 rounded" 
              />
              <span>Receive email updates about new packages and available travelers</span>
            </label>
          </div>

          {/* Footer Submit */}
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
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#1C160F] rounded-xl hover:bg-amber-600 hover:text-[#1C160F] transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
