
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderItem } from '../types';
import { Input } from '../components/Input';
import { FileUp, Plus, Save, Download, X, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Order>>({
    orderNumber: '',
    customerCode: '',
    customerName: '',
    supplierCode: '',
    orderDate: new Date().toISOString().slice(0, 10),
    type: 'VDA_4905',
    status: 'OPEN',
    items: []
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  
  // Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importType, setImportType] = useState('VDA_4905'); // Local state for modal selection

  const handleAddItem = () => {
    setItems([
        ...items, 
        { 
            id: Date.now().toString(), 
            partNo: '', 
            description: '', 
            orderQty: 0, 
            shippedQty: 0, 
            unit: 'PCE', 
            deliveryDate: formData.orderDate || '',
            customerOrderNo: '' 
        }
    ]);
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const saveOrder = () => {
    if (!formData.orderNumber || !formData.customerCode) {
        alert("Lütfen temel bilgileri doldurun.");
        return;
    }
    const newOrder: Order = {
        id: Date.now().toString(),
        orderNumber: formData.orderNumber!,
        customerCode: formData.customerCode!,
        customerName: formData.customerName || 'Bilinmeyen Müşteri',
        supplierCode: formData.supplierCode || '',
        orderDate: formData.orderDate!,
        type: formData.type as any,
        status: 'OPEN',
        items: items
    };

    // Save to LocalStorage
    const existing = JSON.parse(localStorage.getItem('vda_orders') || '[]');
    localStorage.setItem('vda_orders', JSON.stringify([...existing, newOrder]));
    navigate('/orders');
  };

  // --- EXCEL LOGIC ---

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
        { 
            PartNo: 'ORNEK-PARCA-01', 
            Description: 'Ornek Parca Tanimi', 
            Quantity: 1000, 
            Unit: 'PCE', 
            DeliveryDate: '2024-12-31', 
            CustomerOrderRef: 'PO-12345' 
        }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sablon");
    XLSX.writeFile(wb, "Siparis_Sablonu.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        validateAndPreview(data);
    };
    reader.readAsBinaryString(file);
  };

  const validateAndPreview = (data: any[]) => {
      const errors: string[] = [];
      const validItems: any[] = [];

      if (data.length === 0) {
          errors.push("Dosya boş veya okunamadı.");
      }

      data.forEach((row, index) => {
          if (!row.PartNo) errors.push(`Satır ${index + 2}: PartNo eksik.`);
          if (!row.Quantity || isNaN(row.Quantity)) errors.push(`Satır ${index + 2}: Miktar hatalı.`);
          validItems.push(row);
      });

      setImportErrors(errors);
      setImportData(validItems);
  };

  const confirmImport = () => {
      const mappedItems: OrderItem[] = importData.map((row, idx) => ({
          id: Date.now() + idx.toString(),
          partNo: row.PartNo || '',
          description: row.Description || '',
          orderQty: Number(row.Quantity) || 0,
          shippedQty: 0,
          unit: row.Unit || 'PCE',
          deliveryDate: row.DeliveryDate || formData.orderDate,
          customerOrderNo: row.CustomerOrderRef || ''
      }));

      setItems([...items, ...mappedItems]);
      // Update the main form type to match what was selected in modal
      setFormData(prev => ({ ...prev, type: importType as any }));
      
      setShowImportModal(false);
      setImportData([]);
      setImportErrors([]);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold text-slate-800">Yeni Sipariş Girişi</h1>
         <button onClick={() => setShowImportModal(true)} className="flex items-center text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 shadow-lg shadow-slate-900/20 transition-all">
             <FileUp className="w-4 h-4 mr-2" />
             Excel ile Toplu Yükle
         </button>
      </div>

      {/* HEADER FORM */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Sipariş Başlığı</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Dahili Sipariş No" value={formData.orderNumber} onChange={e => setFormData({...formData, orderNumber: e.target.value})} placeholder="Örn: ORD-2024-001" />
              <Input label="Müşteri Kodu" value={formData.customerCode} onChange={e => setFormData({...formData, customerCode: e.target.value})} placeholder="Örn: 987654321" />
              <Input label="Müşteri Adı" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Standart Tipi</label>
                <select 
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="VDA_4905">VDA 4905 (Classic)</option>
                  <option value="DELFOR_D96A">EDIFACT DELFOR D96A</option>
                  <option value="VDA_4984">VDA 4984 (Global DELFOR)</option>
                </select>
              </div>

              <Input label="Sipariş Tarihi" type="date" value={formData.orderDate} onChange={e => setFormData({...formData, orderDate: e.target.value})} />
          </div>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 mb-6">
          <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Kalemler ({items.length})</h3>
              <button onClick={handleAddItem} className="text-sm bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1 rounded font-medium flex items-center transition-colors">
                  <Plus className="w-4 h-4 mr-1" /> Manuel Ekle
              </button>
          </div>
          
          {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-slate-400 text-sm">Henüz kalem eklenmedi.</p>
                  <button onClick={() => setShowImportModal(true)} className="mt-2 text-brand-600 text-sm hover:underline">Excel'den yükle</button>
              </div>
          ) : (
            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 bg-slate-50 border rounded-lg hover:border-brand-200 transition-colors">
                        <div className="col-span-1">
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Parça No</label>
                            <input className="w-full text-xs border rounded p-1 font-mono font-bold bg-white text-slate-900" value={item.partNo} onChange={e => updateItem(item.id, 'partNo', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                             <label className="text-[10px] text-slate-500 uppercase font-bold">Tanım</label>
                             <input className="w-full text-xs border rounded p-1 bg-white text-slate-900" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                        </div>
                        <div className="col-span-1">
                             <label className="text-[10px] text-slate-500 uppercase font-bold">Miktar</label>
                             <input type="number" className="w-full text-xs border rounded p-1 font-bold text-brand-600 bg-white" value={item.orderQty} onChange={e => updateItem(item.id, 'orderQty', parseInt(e.target.value))} />
                        </div>
                        <div className="col-span-1">
                             <label className="text-[10px] text-slate-500 uppercase font-bold">Müşteri Ref</label>
                             <input className="w-full text-xs border rounded p-1 bg-white text-slate-900" value={item.customerOrderNo} onChange={e => updateItem(item.id, 'customerOrderNo', e.target.value)} />
                        </div>
                        <div className="col-span-1">
                             <label className="text-[10px] text-slate-500 uppercase font-bold">Tarih</label>
                             <input type="date" className="w-full text-xs border rounded p-1 bg-white text-slate-900" value={item.deliveryDate} onChange={e => updateItem(item.id, 'deliveryDate', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
          )}
      </div>

      <div className="flex justify-end">
          <button onClick={saveOrder} className="px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-lg flex items-center transition-colors">
              <Save className="w-5 h-5 mr-2" />
              Siparişi Kaydet
          </button>
      </div>

      {/* IMPORT WIZARD MODAL */}
      {showImportModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center">
                          <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
                          Excel İçe Aktarma Sihirbazı
                      </h3>
                      <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="p-6">
                      <div className="mb-6 flex flex-col space-y-4">
                          {/* Version Selector in Modal */}
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">1. İçe Aktarılacak Format Tipi</label>
                            <select 
                                className="w-full border-slate-300 rounded-md shadow-sm p-2 text-sm bg-white text-slate-900 focus:ring-brand-500 focus:border-brand-500"
                                value={importType}
                                onChange={(e) => setImportType(e.target.value)}
                            >
                                <option value="VDA_4905">VDA 4905 (Classic)</option>
                                <option value="DELFOR_D96A">EDIFACT DELFOR D96A</option>
                                <option value="VDA_4984">VDA 4984 (Global)</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Bu seçim, içe aktarma sonrası siparişin tipini belirleyecektir.</p>
                          </div>

                          <div className="flex space-x-4">
                            <button onClick={downloadTemplate} className="flex-1 border border-slate-300 rounded-lg p-4 flex flex-col items-center hover:bg-slate-50 transition-colors group">
                                <Download className="w-6 h-6 text-slate-400 group-hover:text-brand-600 mb-2" />
                                <span className="text-sm font-medium">2. Şablonu İndir</span>
                                <span className="text-xs text-slate-400 mt-1">Siparis_Sablonu.xlsx</span>
                            </button>
                            <label className="flex-1 border border-brand-300 bg-brand-50 border-dashed rounded-lg p-4 flex flex-col items-center cursor-pointer hover:bg-brand-100 transition-colors relative">
                                <FileUp className="w-6 h-6 text-brand-600 mb-2" />
                                <span className="text-sm font-medium text-brand-800">3. Dosya Yükle</span>
                                <span className="text-xs text-brand-600 mt-1">.xlsx, .xls</span>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx, .xls" onChange={handleFileUpload} />
                            </label>
                          </div>
                      </div>

                      {importErrors.length > 0 && (
                          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center text-red-800 font-bold text-sm mb-2">
                                  <AlertCircle className="w-4 h-4 mr-2" /> Hatalar Tespit Edildi
                              </div>
                              <ul className="list-disc pl-5 text-xs text-red-700 space-y-1 max-h-24 overflow-y-auto">
                                  {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                              </ul>
                          </div>
                      )}

                      {importData.length > 0 && importErrors.length === 0 && (
                          <div className="mb-4">
                              <div className="flex items-center text-green-700 font-bold text-sm mb-2">
                                  <CheckCircle className="w-4 h-4 mr-2" /> {importData.length} Kalem Hazır ({importType})
                              </div>
                              <div className="bg-slate-50 rounded border text-xs max-h-40 overflow-y-auto">
                                  <table className="w-full text-left">
                                      <thead className="bg-slate-200 sticky top-0">
                                          <tr>
                                              <th className="p-2">Part No</th>
                                              <th className="p-2">Miktar</th>
                                              <th className="p-2">Tarih</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {importData.slice(0, 5).map((row, i) => (
                                              <tr key={i} className="border-b last:border-0">
                                                  <td className="p-2 font-mono">{row.PartNo}</td>
                                                  <td className="p-2">{row.Quantity}</td>
                                                  <td className="p-2">{row.DeliveryDate}</td>
                                              </tr>
                                          ))}
                                          {importData.length > 5 && (
                                              <tr><td colSpan={3} className="p-2 text-center text-slate-400 italic">... ve {importData.length - 5} kalem daha</td></tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="bg-slate-50 px-6 py-4 border-t flex justify-end">
                      <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 mr-2">İptal</button>
                      <button 
                        onClick={confirmImport} 
                        disabled={importData.length === 0 || importErrors.length > 0}
                        className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Verileri Aktar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
