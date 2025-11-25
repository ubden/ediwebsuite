
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LabelType, SavedReceiver, SavedSupplier, SavedPart, Transporter, Shipment, ShipmentItem, HandlingUnit, Order } from '../types';
import { LabelPreview } from '../components/LabelPreview';
import { Input } from '../components/Input';
import { Printer, Plus, Trash2, Package, FileText, Lock } from 'lucide-react';
import { generateVDA4913, generateDESADV } from '../utils/generator';

export const LabelGenerator: React.FC = () => {
  const location = useLocation();
  const sourceOrder = location.state?.order as Order | undefined;

  const [step, setStep] = useState<'HEADER' | 'ITEMS' | 'PREVIEW'>('HEADER');
  
  // Data Sources
  const [receivers, setReceivers] = useState<SavedReceiver[]>([]);
  const [parts, setParts] = useState<SavedPart[]>([]);
  const [suppliers, setSuppliers] = useState<SavedSupplier[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);

  // Shipment State
  const [header, setHeader] = useState({
    supplierId: '', receiverId: '', transporterId: '', deliveryNote: '', deliveryDate: new Date().toISOString().slice(0, 10)
  });
  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [generatedShipment, setGeneratedShipment] = useState<Shipment | null>(null);

  useEffect(() => {
     // Load DB
     const loadedReceivers = JSON.parse(localStorage.getItem('vda_receivers') || '[]');
     setReceivers(loadedReceivers);
     setParts(JSON.parse(localStorage.getItem('vda_parts') || '[]'));
     const loadedSuppliers = JSON.parse(localStorage.getItem('vda_suppliers') || '[]');
     setSuppliers(loadedSuppliers);
     setTransporters(JSON.parse(localStorage.getItem('vda_transporters') || '[]'));

     // IF SOURCE ORDER EXISTS, AUTO-FILL
     if (sourceOrder) {
         // Find matching receiver by code (Validation Logic)
         const matchedReceiver = loadedReceivers.find((r: SavedReceiver) => r.dockCode === sourceOrder.customerCode || r.name.includes(sourceOrder.customerName));
         const matchedSupplier = loadedSuppliers.find((s: SavedSupplier) => s.supplierCode === sourceOrder.supplierCode);

         setHeader(prev => ({
             ...prev,
             receiverId: matchedReceiver ? matchedReceiver.id : '',
             supplierId: matchedSupplier ? matchedSupplier.id : '',
             deliveryDate: new Date().toISOString().slice(0, 10)
         }));

         // Convert Order Items to Shipment Items
         const newItems: ShipmentItem[] = sourceOrder.items.map(oItem => ({
             id: Date.now() + Math.random().toString(),
             partNo: oItem.partNo, // LOCKED
             description: oItem.description,
             quantityPerPack: 0, // User must define
             totalQuantity: oItem.orderQty - oItem.shippedQty, // Default to remaining
             packCount: 0,
             netWeightPerPack: 0,
             grossWeightPerPack: 0,
             batch: '',
             productionDate: new Date().toISOString().slice(0, 10),
             orderItemId: oItem.id,
             customerOrderNo: oItem.customerOrderNo
         }));
         setItems(newItems);
     }
  }, [sourceOrder]);

  // --- Handlers ---

  const handleAddItem = () => {
    const newItem: ShipmentItem = {
      id: Date.now().toString(),
      partNo: '', description: '', quantityPerPack: 0, totalQuantity: 0, packCount: 0,
      netWeightPerPack: 0, grossWeightPerPack: 0, batch: '', productionDate: header.deliveryDate
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof ShipmentItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      // Auto Calculate Pack Count if fields are present
      if (field === 'totalQuantity' || field === 'quantityPerPack') {
        const total = field === 'totalQuantity' ? Number(value) : item.totalQuantity;
        const perPack = field === 'quantityPerPack' ? Number(value) : item.quantityPerPack;
        if (total > 0 && perPack > 0) {
          updated.packCount = Math.ceil(total / perPack);
        }
      }
      return updated;
    }));
  };

  const autofillPart = (id: string, partId: string) => {
    const p = parts.find(x => x.id === partId);
    if (!p) return;
    setItems(prev => prev.map(item => item.id === id ? {
      ...item,
      partNo: p.partNo,
      description: p.description,
      quantityPerPack: Number(p.defaultQty),
      netWeightPerPack: Number(p.netWeight),
      grossWeightPerPack: Number(p.grossWeight)
    } : item));
  };

  const generateShipment = () => {
    console.log("Generating shipment...", header, items);
    
    // 1. Validation
    const missingFields = [];
    if (!header.supplierId || header.supplierId.trim() === '') missingFields.push("Tedarikçi");
    if (!header.receiverId || header.receiverId.trim() === '') missingFields.push("Müşteri");
    if (!header.deliveryNote || header.deliveryNote.trim() === '') missingFields.push("İrsaliye No");
    if (!header.deliveryDate || header.deliveryDate.trim() === '') missingFields.push("Sevk Tarihi");
    
    if (missingFields.length > 0) {
        alert(`Lütfen şu alanları doldurunuz: ${missingFields.join(", ")}`);
        return;
    }
    if (items.length === 0) {
        alert("En az bir kalem eklemelisiniz.");
        return;
    }

    // Check for incomplete items
    const incomplete = items.find(i => i.packCount <= 0 || !i.partNo);
    if (incomplete) {
        alert("Lütfen tüm kalemler için Parça No, Miktar ve Koli İçi Adet bilgilerini giriniz.");
        return;
    }

    try {
        // 2. Get Snapshots
        const supplier = suppliers.find(s => s.id === header.supplierId);
        const receiver = receivers.find(r => r.id === header.receiverId);
        
        if (!supplier || !receiver) {
            alert("Seçilen tedarikçi veya müşteri sistemde bulunamadı.");
            return;
        }

        const transporter = transporters.find(t => t.id === header.transporterId) || { id: '0', name: '', carrierCode: '' };

        // 3. Serial Logic (Load, Increment, Save)
        let currentSerial = receiver.lastSerialNo || 0;
        const handlingUnits: HandlingUnit[] = [];

        items.forEach(item => {
           for (let i = 0; i < item.packCount; i++) {
              currentSerial++;
              // Handle Partial Box (Last box might have less)
              const isLast = i === item.packCount - 1;
              const qty = isLast ? (item.totalQuantity - (item.quantityPerPack * (item.packCount - 1))) : item.quantityPerPack;

              handlingUnits.push({
                id: `${item.id}-${i}`,
                serialNo: currentSerial.toString().padStart(9, '0'),
                partNo: item.partNo,
                quantity: qty,
                type: 'BOX',
                grossWeight: item.grossWeightPerPack,
                netWeight: item.netWeightPerPack,
                batch: item.batch,
                productionDate: item.productionDate
              });
           }
        });

        // 4. Update Receiver Serial in DB
        const updatedReceivers = receivers.map(r => r.id === receiver.id ? { ...r, lastSerialNo: currentSerial } : r);
        setReceivers(updatedReceivers);
        localStorage.setItem('vda_receivers', JSON.stringify(updatedReceivers));

        // 5. Construct Shipment
        const newShipment: Shipment = {
            id: Date.now().toString(),
            status: 'COMPLETED',
            createdDate: new Date().toISOString(),
            shipmentNumber: `SHP-${Date.now().toString().slice(-6)}`,
            receiverId: header.receiverId,
            supplierId: header.supplierId,
            transporterId: header.transporterId,
            deliveryNote: header.deliveryNote,
            deliveryDate: header.deliveryDate,
            receiverSnapshot: receiver,
            supplierSnapshot: supplier,
            transporterSnapshot: transporter,
            items: items,
            handlingUnits: handlingUnits,
            relatedOrderId: sourceOrder?.id
        };

        setGeneratedShipment(newShipment);
        
        // Save to Shipment History
        const existingHistory = JSON.parse(localStorage.getItem('vda_shipments') || '[]');
        localStorage.setItem('vda_shipments', JSON.stringify([...existingHistory, newShipment]));

        setStep('PREVIEW');
    } catch (error) {
        console.error("Error generating shipment:", error);
        alert("Sevkiyat oluşturulurken bir hata oluştu. Lütfen konsolu kontrol edin.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadASN = (type: 'VDA4913' | 'DESADV') => {
      if (!generatedShipment) return;

      const asnData = {
          deliveryNoteNumber: generatedShipment.deliveryNote,
          deliveryDate: generatedShipment.deliveryDate,
          supplierId: generatedShipment.supplierSnapshot.supplierCode,
          customerId: generatedShipment.receiverSnapshot.dockCode, // Using Dock Code as ID mostly in VDA
          transportMode: '10', // Truck
          carrier: generatedShipment.transporterSnapshot.carrierCode,
          items: generatedShipment.items.map(i => ({
              id: i.id,
              partNumber: i.partNo,
              quantity: i.totalQuantity,
              orderNumber: i.customerOrderNo || '',
              packageType: 'KLT' // Default
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

  // --- Render Steps ---

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
             <Package className="w-6 h-6 mr-2 text-brand-600" />
             Sevkiyat Oluşturucu
          </h1>
          <p className="text-sm text-slate-500">
             {sourceOrder ? `Sipariş Bazlı Sevkiyat: ${sourceOrder.orderNumber}` : 'VDA 4902 Standartlarında Etiketleme'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
             {/* Progress Stepper */}
             <div className="flex items-center text-sm font-medium mr-8 bg-slate-100 rounded-full px-4 py-1">
                <span className={`${step === 'HEADER' ? 'text-brand-600' : 'text-slate-400'}`}>1. Başlık</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className={`${step === 'ITEMS' ? 'text-brand-600' : 'text-slate-400'}`}>2. Kalemler</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className={`${step === 'PREVIEW' ? 'text-brand-600' : 'text-slate-400'}`}>3. Yazdır & ASN</span>
             </div>
             
             {step === 'PREVIEW' && (
                <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Etiketleri Yazdır
                </button>
             )}
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full flex-1">
        
        {/* STEP 1: HEADER INFO */}
        {step === 'HEADER' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b flex justify-between">
                    Sevkiyat Bilgileri
                    {sourceOrder && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded border border-orange-200">Siparişten Aktarıldı</span>}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tedarikçi (Gönderen)</label>
                        <select 
                            className="w-full border-slate-300 rounded-md shadow-sm p-2.5 bg-white text-slate-900"
                            value={header.supplierId}
                            onChange={e => setHeader({...header, supplierId: e.target.value})}
                        >
                            <option value="">Seçiniz...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Müşteri (Alıcı)</label>
                        <select 
                            className="w-full border-slate-300 rounded-md shadow-sm p-2.5 bg-white text-slate-900"
                            value={header.receiverId}
                            onChange={e => setHeader({...header, receiverId: e.target.value})}
                        >
                            <option value="">Seçiniz...</option>
                            {receivers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.plant})</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Nakliyeci</label>
                         <select 
                            className="w-full border-slate-300 rounded-md shadow-sm p-2.5 bg-white text-slate-900"
                            value={header.transporterId}
                            onChange={e => setHeader({...header, transporterId: e.target.value})}
                        >
                            <option value="">Seçiniz...</option>
                            {transporters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <Input label="İrsaliye No (Delivery Note)" value={header.deliveryNote} onChange={e => setHeader({...header, deliveryNote: e.target.value})} placeholder="Örn: 80012345" />
                    <Input label="Sevk Tarihi" type="date" value={header.deliveryDate} onChange={e => setHeader({...header, deliveryDate: e.target.value})} />
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => setStep('ITEMS')} className="px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors">
                        Devam Et: Kalem Ekle &rarr;
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: ITEMS */}
        {step === 'ITEMS' && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">Sevkiyat Kalemleri</h2>
                        {!sourceOrder && (
                            <button onClick={handleAddItem} className="flex items-center text-sm bg-brand-600 text-white px-3 py-1.5 rounded hover:bg-brand-700">
                                <Plus className="w-4 h-4 mr-1" /> Satır Ekle
                            </button>
                        )}
                    </div>
                    
                    {/* Excel-like Table Header */}
                    <div className="grid grid-cols-12 gap-2 bg-slate-100 p-2 text-xs font-bold text-slate-600 uppercase border-b">
                        <div className="col-span-1">Kayıtlı Parça</div>
                        <div className="col-span-2">Parça No (Müşteri)</div>
                        <div className="col-span-2">Tanım</div>
                        <div className="col-span-1 text-center">Toplam Adet</div>
                        <div className="col-span-1 text-center">Koli İçi</div>
                        <div className="col-span-1 text-center">Koli Sayısı</div>
                        <div className="col-span-1">Net/Brüt (Kg)</div>
                        <div className="col-span-1">Batch / Lot</div>
                        <div className="col-span-1">Ürt. Tarihi</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {items.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                Henüz kalem eklenmedi.
                            </div>
                        )}
                        {items.map((item, idx) => (
                            <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 items-center hover:bg-slate-50 transition-colors group ${item.orderItemId ? 'bg-orange-50/50' : ''}`}>
                                <div className="col-span-1">
                                    <select 
                                        className="w-full text-xs border-slate-300 rounded bg-white text-slate-900" 
                                        onChange={(e) => autofillPart(item.id, e.target.value)} 
                                        defaultValue=""
                                        disabled={!!item.orderItemId}
                                    >
                                        <option value="" disabled>Seç...</option>
                                        {parts.map(p => <option key={p.id} value={p.id}>{p.partNo}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 relative">
                                    <input 
                                        className={`w-full text-xs border-slate-300 rounded font-mono font-bold text-slate-900 ${item.orderItemId ? 'bg-slate-100 text-slate-500' : 'bg-white'}`} 
                                        value={item.partNo} 
                                        onChange={e => updateItem(item.id, 'partNo', e.target.value)} 
                                        placeholder="Part No"
                                        readOnly={!!item.orderItemId}
                                    />
                                    {item.orderItemId && <Lock className="w-3 h-3 text-slate-400 absolute right-2 top-2.5" />}
                                </div>
                                <div className="col-span-2">
                                     <input className="w-full text-xs border-slate-300 rounded bg-white text-slate-900" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Açıklama" />
                                </div>
                                <div className="col-span-1">
                                     <input type="number" className="w-full text-xs border-slate-300 rounded text-center font-bold bg-white text-slate-900" value={item.totalQuantity || ''} onChange={e => updateItem(item.id, 'totalQuantity', e.target.value)} placeholder="0" />
                                </div>
                                <div className="col-span-1">
                                     <input type="number" className="w-full text-xs border-slate-300 rounded text-center bg-white text-slate-900" value={item.quantityPerPack || ''} onChange={e => updateItem(item.id, 'quantityPerPack', e.target.value)} placeholder="0" />
                                </div>
                                <div className="col-span-1 text-center font-bold text-brand-600 bg-slate-100 py-1 rounded">
                                    {item.packCount}
                                </div>
                                <div className="col-span-1 flex space-x-1">
                                     <input type="number" className="w-1/2 text-xs border-slate-300 rounded bg-white text-slate-900" value={item.netWeightPerPack} onChange={e => updateItem(item.id, 'netWeightPerPack', e.target.value)} placeholder="Net" />
                                     <input type="number" className="w-1/2 text-xs border-slate-300 rounded bg-white text-slate-900" value={item.grossWeightPerPack} onChange={e => updateItem(item.id, 'grossWeightPerPack', e.target.value)} placeholder="Brüt" />
                                </div>
                                <div className="col-span-1">
                                     <input className="w-full text-xs border-slate-300 rounded bg-white text-slate-900" value={item.batch} onChange={e => updateItem(item.id, 'batch', e.target.value)} placeholder="LOT123" />
                                </div>
                                <div className="col-span-1">
                                     <input type="date" className="w-full text-xs border-slate-300 rounded bg-white text-slate-900" value={item.productionDate} onChange={e => updateItem(item.id, 'productionDate', e.target.value)} />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-between">
                    <button onClick={() => setStep('HEADER')} className="text-slate-500 font-medium hover:text-slate-800">
                        &larr; Geri Dön
                    </button>
                    <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm border border-blue-200">
                        Toplam <strong>{items.reduce((acc, curr) => acc + (curr.packCount || 0), 0)}</strong> etiket oluşturulacak.
                    </div>
                    <button onClick={generateShipment} className="px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200">
                        Etiketleri Oluştur &rarr;
                    </button>
                </div>
             </div>
        )}

        {/* STEP 3: PREVIEW & PRINT */}
        {step === 'PREVIEW' && generatedShipment && (
            <div className="animate-in fade-in">
                <div className="mb-6 flex justify-between items-center no-print">
                    <button onClick={() => setStep('ITEMS')} className="text-slate-500 font-medium hover:text-slate-800">
                        &larr; Düzenlemeye Dön
                    </button>
                    <div className="flex space-x-3">
                         <button onClick={() => downloadASN('VDA4913')} className="flex items-center px-4 py-2 border border-slate-300 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50">
                            <FileText className="w-4 h-4 mr-2" />
                            VDA 4913 İndir
                         </button>
                         <button onClick={() => downloadASN('DESADV')} className="flex items-center px-4 py-2 border border-slate-300 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50">
                            <FileText className="w-4 h-4 mr-2" />
                            EDIFACT ASN İndir
                         </button>
                    </div>
                </div>

                {/* Print Container - This will be what gets printed */}
                <div className="bg-slate-300 p-8 min-h-screen flex flex-col items-center print:bg-white print:p-0 print:block">
                    {generatedShipment.handlingUnits.map((hu, index) => {
                        // Map HandlingUnit back to LabelFormData structure for the Preview Component
                        const labelData = {
                            receiverName: generatedShipment.receiverSnapshot.name,
                            receiverLocation: generatedShipment.receiverSnapshot.plant,
                            dockCode: generatedShipment.receiverSnapshot.dockCode,
                            supplierName: generatedShipment.supplierSnapshot.name,
                            supplierId: generatedShipment.supplierSnapshot.supplierCode,
                            partNo: hu.partNo,
                            description: generatedShipment.items.find(i => i.partNo === hu.partNo)?.description || '',
                            quantity: hu.quantity.toString(),
                            netWeight: hu.netWeight.toString(),
                            grossWeight: hu.grossWeight.toString(),
                            date: hu.productionDate,
                            batch: hu.batch,
                            deliveryNote: generatedShipment.deliveryNote,
                            serialNo: hu.serialNo,
                            packageId: ''
                        };

                        return (
                            <div key={hu.id} className="mb-8 print:mb-0 print:break-after-page shadow-2xl print:shadow-none">
                                <LabelPreview data={labelData} type={LabelType.VDA_4902} />
                                <div className="text-center mt-2 text-xs text-slate-500 font-mono no-print">
                                    Etiket {index + 1} / {generatedShipment.handlingUnits.length} - Seri: {hu.serialNo}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
