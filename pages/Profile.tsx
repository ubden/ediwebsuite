
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Save, User, Building, Mail, Phone } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    title: user?.title || '',
    phone: user?.phone || ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Profilim</h1>
      <p className="text-slate-500 mb-8">Kişisel bilgilerinizi ve şirket detaylarınızı yönetin.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow border border-slate-200 p-6 text-center">
                  <div className="w-32 h-32 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center text-slate-300 border-4 border-white shadow-lg">
                      <User className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{user?.company}</p>
                  <button className="text-sm text-brand-600 font-medium hover:underline">Fotoğrafı Değiştir</button>
              </div>
          </div>

          <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow border border-slate-200 p-6">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold border-b pb-4 mb-6">
                      <User className="w-5 h-5" />
                      <span>Kişisel Bilgiler</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="Ad Soyad" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                      <Input 
                        label="Unvan" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                      />
                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">E-Posta</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute top-2.5 left-3 text-slate-400" />
                            <input 
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                          </div>
                      </div>
                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Telefon</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute top-2.5 left-3 text-slate-400" />
                            <input 
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-800 font-bold border-b pb-4 mb-6 mt-8">
                      <Building className="w-5 h-5" />
                      <span>Şirket Bilgileri</span>
                  </div>
                  <Input 
                    label="Şirket Adı" 
                    value={formData.company} 
                    onChange={e => setFormData({...formData, company: e.target.value})} 
                  />

                  <div className="mt-8 flex items-center justify-between">
                      {success && <span className="text-green-600 font-medium animate-in fade-in">Değişiklikler kaydedildi!</span>}
                      {!success && <span></span>}
                      <button type="submit" className="flex items-center px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm font-medium">
                          <Save className="w-4 h-4 mr-2" />
                          Kaydet
                      </button>
                  </div>
              </form>
          </div>
      </div>
    </div>
  );
};
