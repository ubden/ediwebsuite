
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building, Package, User, Truck, MapPin, Mail, Phone, Hash, Calendar, AlertTriangle, Box } from 'lucide-react';
import { SavedReceiver, SavedSupplier, SavedPart, Transporter } from '../types';
import { Input } from '../components/Input';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'receivers' | 'parts' | 'transporters'>('suppliers');
  
  const [suppliers, setSuppliers] = useState<SavedSupplier[]>([]);
  const [receivers, setReceivers] = useState<SavedReceiver[]>([]);
  const [parts, setParts] = useState<SavedPart[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);

  useEffect(() => {
    const sS = localStorage.getItem('vda_suppliers');
    const sR = localStorage.getItem('vda_receivers');
    const sP = localStorage.getItem('vda_parts');
    const sT = localStorage.getItem('vda_transporters');

    if (sS) setSuppliers(JSON.parse(sS));
    if (sR) setReceivers(JSON.parse(sR));
    if (sP) setParts(JSON.parse(sP));
    if (sT) setTransporters(JSON.parse(sT));
  }, []);

  const saveToLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const updateList = (setter: any, key: string, newList: any) => {
    setter(newList);
    saveToLocal(key, newList);
  };

  const addItem = (type: string) => {
    const id = Date.now().toString();
    if (type === 'supplier') updateList(setSuppliers, 'vda_suppliers', [...suppliers, { id, name: 'Yeni Tedarikçi', supplierCode: '', address: '', country: 'TR' }]);
    if (type === 'receiver') updateList(setReceivers, 'vda_receivers', [...receivers, { id, name: 'Yeni Müşteri', plant: '', dockCode: '', lastSerialNo: 0, address: '', country: 'DE' }]);
    if (type === 'part') updateList(setParts, 'vda_parts', [...parts, { id, partNo: '', description: '', defaultQty: '1', netWeight: '0', grossWeight: '0', shelfLife: '', packagingCode: '', unNumber: '' }]);
    if (type === 'transporter') updateList(setTransporters, 'vda_transporters', [...transporters, { id, name: 'Yeni Nakliyeci', carrierCode: '' }]);
  };

  const removeItem = (type: string, id: string) => {
    if (type === 'supplier') updateList(setSuppliers, 'vda_suppliers', suppliers.filter(x => x.id !== id));
    if (type === 'receiver') updateList(setReceivers, 'vda_receivers', receivers.filter(x => x.id !== id));
    if (type === 'part') updateList(setParts, 'vda_parts', parts.filter(x => x.id !== id));
    if (type === 'transporter') updateList(setTransporters, 'vda_transporters', transporters.filter(x => x.id !== id));
  };

  const updateItem = (type: string, id: string, field: string, val: any) => {
     const updater = (list: any[]) => list.map(item => item.id === id ? { ...item, [field]: val } : item);
     if (type === 'supplier') updateList(setSuppliers, 'vda_suppliers', updater(suppliers));
     if (type === 'receiver') updateList(setReceivers, 'vda_receivers', updater(receivers));
     if (type === 'part') updateList(setParts, 'vda_parts', updater(parts));
     if (type === 'transporter') updateList(setTransporters, 'vda_transporters', updater(transporters));
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Genel Ayarlar</h1>
      <p className="text-slate-500 mb-8">VDA veritabanı ve lojistik parametre yönetimi.</p>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg mb-8 max-w-3xl">
        {[
            { id: 'suppliers', icon: Building, label: 'Tedarikçiler' },
            { id: 'receivers', icon: User, label: 'Müşteriler' },
            { id: 'parts', icon: Package, label: 'Malzemeler' },
            { id: 'transporters', icon: Truck, label: 'Nakliyeciler' }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id ? 'bg-white text-brand-600 shadow-md transform scale-105' : 'text-slate-600 hover:text-slate-900'}`}
            >
                <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
            </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 min-h-[400px]">
        <div className="flex justify-end mb-6">
             <button onClick={() => addItem(activeTab.slice(0, -1))} className="flex items-center text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 shadow-md transition-colors font-bold">
                <Plus className="w-4 h-4 mr-2" /> Yeni Ekle
              </button>
        </div>

        <div className="space-y-6">
            {activeTab === 'suppliers' && suppliers.map(s => (
                <div key={s.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50 relative group hover:shadow-md transition-all">
                    <button onClick={() => removeItem('supplier', s.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2"><Input label="Firma Adı" value={s.name} onChange={(e) => updateItem('supplier', s.id, 'name', e.target.value)} /></div>
                        <Input label="VDA Kodu (Supplier Code)" value={s.supplierCode} onChange={(e) => updateItem('supplier', s.id, 'supplierCode', e.target.value)} />
                        <Input label="Vergi No / DUNS" value={s.taxId} onChange={(e) => updateItem('supplier', s.id, 'taxId', e.target.value)} />
                        
                        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 pt-4 mt-2">
                             <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Adres</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={s.address} onChange={(e) => updateItem('supplier', s.id, 'address', e.target.value)} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ülke</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={s.country} onChange={(e) => updateItem('supplier', s.id, 'country', e.target.value)} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">İlgili Kişi</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={s.contactPerson} onChange={(e) => updateItem('supplier', s.id, 'contactPerson', e.target.value)} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-Posta</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={s.email} onChange={(e) => updateItem('supplier', s.id, 'email', e.target.value)} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={s.phone} onChange={(e) => updateItem('supplier', s.id, 'phone', e.target.value)} />
                             </div>
                        </div>
                    </div>
                </div>
            ))}

            {activeTab === 'receivers' && receivers.map(r => (
                <div key={r.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50 relative group hover:shadow-md transition-all">
                    <button onClick={() => removeItem('receiver', r.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Müşteri Adı" value={r.name} onChange={(e) => updateItem('receiver', r.id, 'name', e.target.value)} />
                        <Input label="Fabrika / Plant" value={r.plant} onChange={(e) => updateItem('receiver', r.id, 'plant', e.target.value)} />
                        <Input label="Dock Code / Unloading Point" value={r.dockCode} onChange={(e) => updateItem('receiver', r.id, 'dockCode', e.target.value)} />
                        <Input label="Ülke" value={r.country} onChange={(e) => updateItem('receiver', r.id, 'country', e.target.value)} />
                        <Input label="KDV No" value={r.vatNumber} onChange={(e) => updateItem('receiver', r.id, 'vatNumber', e.target.value)} />
                        <Input label="Son Etiket Seri No" type="number" value={r.lastSerialNo} onChange={(e) => updateItem('receiver', r.id, 'lastSerialNo', parseInt(e.target.value))} />
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Sevk Adresi</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={r.address} onChange={(e) => updateItem('receiver', r.id, 'address', e.target.value)} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">İlgili Kişi</label>
                                    <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={r.contactPerson} onChange={(e) => updateItem('receiver', r.id, 'contactPerson', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-Posta</label>
                                    <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={r.email} onChange={(e) => updateItem('receiver', r.id, 'email', e.target.value)} />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            ))}

            {activeTab === 'transporters' && transporters.map(t => (
                 <div key={t.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50 relative group hover:shadow-md transition-all">
                    <button onClick={() => removeItem('transporter', t.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2"><Input label="Nakliyeci Adı" value={t.name} onChange={(e) => updateItem('transporter', t.id, 'name', e.target.value)} /></div>
                        <Input label="SCAC / VDA Kodu" value={t.carrierCode} onChange={(e) => updateItem('transporter', t.id, 'carrierCode', e.target.value)} />
                        <Input label="Telefon" value={t.phone} onChange={(e) => updateItem('transporter', t.id, 'phone', e.target.value)} />
                    </div>
                </div>
            ))}

            {activeTab === 'parts' && parts.map(p => (
                 <div key={p.id} className="p-6 border border-slate-200 rounded-xl bg-slate-50 relative group hover:shadow-md transition-all">
                    <button onClick={() => removeItem('part', p.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1"><Input label="Parça No" value={p.partNo} onChange={(e) => updateItem('part', p.id, 'partNo', e.target.value)} /></div>
                        <div className="md:col-span-2"><Input label="Tanım" value={p.description} onChange={(e) => updateItem('part', p.id, 'description', e.target.value)} /></div>
                        <Input label="GTIP (HS Code)" value={p.customsCode} onChange={(e) => updateItem('part', p.id, 'customsCode', e.target.value)} />
                        
                        <Input label="Koli İçi Adet" value={p.defaultQty} onChange={(e) => updateItem('part', p.id, 'defaultQty', e.target.value)} />
                        <Input label="Net Kg" value={p.netWeight} onChange={(e) => updateItem('part', p.id, 'netWeight', e.target.value)} />
                        <Input label="Brüt Kg" value={p.grossWeight} onChange={(e) => updateItem('part', p.id, 'grossWeight', e.target.value)} />
                        <Input label="Menşei" value={p.originCountry} onChange={(e) => updateItem('part', p.id, 'originCountry', e.target.value)} />
                        
                        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Raf Ömrü (Ay)</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={p.shelfLife} onChange={(e) => updateItem('part', p.id, 'shelfLife', e.target.value)} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center"><Box className="w-3 h-3 mr-1"/> Ambalaj Kodu (KLT/Box)</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={p.packagingCode} onChange={(e) => updateItem('part', p.id, 'packagingCode', e.target.value)} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> UN Number (Tehlikeli Madde)</label>
                                <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm" value={p.unNumber} onChange={(e) => updateItem('part', p.id, 'unNumber', e.target.value)} />
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
