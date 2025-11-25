
import React, { useState } from 'react';
import { AsnFormData, AsnType, AsnItem } from '../types';
import { Input } from '../components/Input';
import { generateVDA4913, generateDESADV } from '../utils/generator';
import { FileCode, Download, Plus, Trash2 } from 'lucide-react';

interface Props {
  type: AsnType;
}

const INITIAL_DATA: AsnFormData = {
  deliveryNoteNumber: '23000156',
  deliveryDate: new Date().toISOString().slice(0, 10),
  supplierId: '123456789',
  customerId: '987654321',
  transportMode: '10',
  carrier: 'DHL',
  items: [
    { id: '1', partNumber: 'A000123456', quantity: 100, orderNumber: 'PO55001', packageType: 'KLT' }
  ]
};

export const AsnGenerator: React.FC<Props> = ({ type }) => {
  const [data, setData] = useState<AsnFormData>(INITIAL_DATA);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof AsnItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    const newItem: AsnItem = {
      id: Date.now().toString(),
      partNumber: '',
      quantity: 0,
      orderNumber: '',
      packageType: ''
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const generateFile = () => {
    const output = type === AsnType.VDA4913 ? generateVDA4913(data) : generateDESADV(data);
    setGeneratedOutput(output);
  };

  const downloadFile = () => {
    if (!generatedOutput) return;
    const blob = new Blob([generatedOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === AsnType.VDA4913 ? `VDA4913_${data.deliveryNoteNumber}.txt` : `DESADV_${data.deliveryNoteNumber}.edi`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {type === AsnType.VDA4913 ? 'VDA 4913 Oluşturucu' : 'EDIFACT DESADV D96A Oluşturucu'}
          </h1>
          <p className="text-slate-500 mt-2">
            {type === AsnType.VDA4913 ? 'Klasik VDA formatında düz metin dosyası oluşturun.' : 'Global EDI standardında sevkiyat bildirimi oluşturun.'}
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wide">
            {type === AsnType.VDA4913 ? 'Fixed Length' : 'EDI Segment'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-6 bg-brand-500 rounded-r mr-3"></span>
              Başlık Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="İrsaliye No" name="deliveryNoteNumber" value={data.deliveryNoteNumber} onChange={handleChange} />
              <Input label="Sevk Tarihi" name="deliveryDate" type="date" value={data.deliveryDate} onChange={handleChange} />
              <Input label="Tedarikçi ID" name="supplierId" value={data.supplierId} onChange={handleChange} />
              <Input label="Müşteri ID" name="customerId" value={data.customerId} onChange={handleChange} />
              <Input label="Taşıma Modu" name="transportMode" value={data.transportMode} onChange={handleChange} />
              <Input label="Nakliyeci" name="carrier" value={data.carrier} onChange={handleChange} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <span className="w-1 h-6 bg-brand-500 rounded-r mr-3"></span>
                Kalemler
              </h3>
              <button onClick={addItem} className="flex items-center text-sm text-brand-600 font-medium hover:text-brand-700">
                <Plus className="w-4 h-4 mr-1" /> Satır Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {data.items.map((item, index) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                  <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Parça No</label>
                        <input className="w-full text-sm border-slate-300 rounded focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900" value={item.partNumber} onChange={(e) => handleItemChange(item.id, 'partNumber', e.target.value)} />
                     </div>
                     <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Sipariş No</label>
                        <input className="w-full text-sm border-slate-300 rounded focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900" value={item.orderNumber} onChange={(e) => handleItemChange(item.id, 'orderNumber', e.target.value)} />
                     </div>
                     <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Miktar</label>
                        <input type="number" className="w-full text-sm border-slate-300 rounded focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} />
                     </div>
                     <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Ambalaj Tipi</label>
                        <input className="w-full text-sm border-slate-300 rounded focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-900" value={item.packageType} onChange={(e) => handleItemChange(item.id, 'packageType', e.target.value)} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Section - Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-slate-900 rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <span className="text-slate-300 font-mono text-sm flex items-center">
                    <FileCode className="w-4 h-4 mr-2" />
                    {type === AsnType.VDA4913 ? 'Output.txt' : 'Output.edi'}
                </span>
                <button onClick={generateFile} className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1 rounded transition-colors">
                    Önizle
                </button>
             </div>
             <div className="flex-1 p-4 overflow-auto bg-slate-900 font-mono text-xs text-green-400 whitespace-pre scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {generatedOutput || '// Henüz veri oluşturulmadı...\n// Verileri girip "Önizle" butonuna basın.'}
             </div>
             <div className="p-4 bg-slate-800 border-t border-slate-700">
                <button 
                    onClick={downloadFile}
                    disabled={!generatedOutput}
                    className="w-full flex justify-center items-center py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Dosyayı İndir
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
