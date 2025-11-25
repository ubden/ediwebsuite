
import React, { useState, useEffect } from 'react';
import { Shipment } from '../types';
import { Box, FileText, ArrowRight, Calendar, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ShipmentList: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('vda_shipments') || '[]');
    setShipments(data.reverse()); // Show newest first
  }, []);

  const filtered = shipments.filter(s => 
    s.deliveryNote.includes(searchTerm) || 
    s.receiverSnapshot.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold text-slate-800">Geçmiş Sevkiyatlar</h1>
         <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="İrsaliye No veya Müşteri Ara..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-brand-500 focus:border-brand-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
                <Box className="w-12 h-12 mx-auto mb-3 opacity-20" />
                Kayıtlı sevkiyat bulunamadı.
            </div>
        ) : (
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">İrsaliye No</th>
                        <th className="px-6 py-4">Müşteri</th>
                        <th className="px-6 py-4">Sevk Tarihi</th>
                        <th className="px-6 py-4 text-center">Koli Adedi</th>
                        <th className="px-6 py-4 text-center">Durum</th>
                        <th className="px-6 py-4 text-right">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.map(shipment => (
                        <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900">{shipment.deliveryNote}</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{shipment.receiverSnapshot.name}</div>
                                <div className="text-xs text-slate-500">{shipment.receiverSnapshot.plant}</div>
                            </td>
                            <td className="px-6 py-4 flex items-center text-slate-600">
                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                {shipment.deliveryDate}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                                    {shipment.handlingUnits.length}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                    Tamamlandı
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                                    className="text-brand-600 hover:text-brand-800 font-medium text-xs flex items-center justify-end ml-auto"
                                >
                                    Detay
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};
