
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shipment, LabelType } from '../types';
import { LabelPreview } from '../components/LabelPreview';
import { ArrowLeft, Printer, FileText, Package, Calendar } from 'lucide-react';
import { generateVDA4913, generateDESADV } from '../utils/generator';

export const ShipmentDetail: React.FC = () => {
  const { id } = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    const allShipments = JSON.parse(localStorage.getItem('vda_shipments') || '[]');
    const found = allShipments.find((s: Shipment) => s.id === id);
    setShipment(found || null);
  }, [id]);

  if (!shipment) {
    return <div className="p-10 text-center text-slate-500">Sevkiyat bulunamadı.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const downloadASN = (type: 'VDA4913' | 'DESADV') => {
      const asnData = {
          deliveryNoteNumber: shipment.deliveryNote,
          deliveryDate: shipment.deliveryDate,
          supplierId: shipment.supplierSnapshot.supplierCode,
          customerId: shipment.receiverSnapshot.dockCode,
          transportMode: '10',
          carrier: shipment.transporterSnapshot.carrierCode,
          items: shipment.items.map(i => ({
              id: i.id,
              partNumber: i.partNo,
              quantity: i.totalQuantity,
              orderNumber: i.customerOrderNo || '',
              packageType: 'KLT'
          }))
      };

      const content = type === 'VDA4913' ? generateVDA4913(asnData) : generateDESADV(asnData);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'VDA4913' ? `VDA4913_${asnData.deliveryNoteNumber}.txt` : `DESADV_${asnData.deliveryNoteNumber}.edi`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm no-print">
            <div className="flex items-center">
                <Link to="/shipments" className="mr-4 text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sevkiyat Detayı</h1>
                    <p className="text-sm text-slate-500">İrsaliye: {shipment.deliveryNote}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                 <button onClick={() => downloadASN('VDA4913')} className="flex items-center px-3 py-2 border border-slate-300 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
                    <FileText className="w-4 h-4 mr-2" />
                    VDA 4913
                 </button>
                 <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Etiketleri Yazdır
                </button>
            </div>
       </div>

       <div className="p-6 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Alıcı (Müşteri)</h3>
                     <div className="text-lg font-bold text-slate-900">{shipment.receiverSnapshot.name}</div>
                     <div className="text-sm text-slate-600">{shipment.receiverSnapshot.plant}</div>
                     <div className="mt-2 text-xs text-slate-400">Dock: {shipment.receiverSnapshot.dockCode}</div>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Tedarikçi</h3>
                     <div className="text-lg font-bold text-slate-900">{shipment.supplierSnapshot.name}</div>
                     <div className="text-sm text-slate-600">{shipment.supplierSnapshot.supplierCode}</div>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Sevk Bilgileri</h3>
                     <div className="flex items-center text-slate-700 mb-1">
                        <Calendar className="w-4 h-4 mr-2" /> {shipment.deliveryDate}
                     </div>
                     <div className="flex items-center text-slate-700">
                        <Package className="w-4 h-4 mr-2" /> {shipment.handlingUnits.length} Koli / Palet
                     </div>
                 </div>
            </div>

            <div className="bg-slate-300 p-8 flex flex-col items-center print:bg-white print:p-0 print:block">
                {shipment.handlingUnits.map((hu, index) => {
                    const labelData = {
                        receiverName: shipment.receiverSnapshot.name,
                        receiverLocation: shipment.receiverSnapshot.plant,
                        dockCode: shipment.receiverSnapshot.dockCode,
                        supplierName: shipment.supplierSnapshot.name,
                        supplierId: shipment.supplierSnapshot.supplierCode,
                        partNo: hu.partNo,
                        description: shipment.items.find(i => i.partNo === hu.partNo)?.description || '',
                        quantity: hu.quantity.toString(),
                        netWeight: hu.netWeight.toString(),
                        grossWeight: hu.grossWeight.toString(),
                        date: hu.productionDate,
                        batch: hu.batch,
                        deliveryNote: shipment.deliveryNote,
                        serialNo: hu.serialNo,
                        packageId: ''
                    };
                    return (
                        <div key={hu.id} className="mb-8 print:mb-0 print:break-after-page shadow-2xl print:shadow-none">
                            <LabelPreview data={labelData} type={LabelType.VDA_4902} />
                            <div className="text-center mt-2 text-xs text-slate-500 font-mono no-print">
                                Etiket {index + 1} / {shipment.handlingUnits.length}
                            </div>
                        </div>
                    );
                })}
            </div>
       </div>
    </div>
  );
};
