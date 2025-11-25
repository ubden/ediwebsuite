
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shipment, LabelType } from '../types';
import { LabelPreview } from '../components/LabelPreview';
import { ArrowLeft, Printer, FileText, Package, Calendar, Download, Eye, X } from 'lucide-react';
import { generateVDA4913, generateDESADV } from '../utils/generator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ShipmentDetail: React.FC = () => {
  const { id } = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [asnPreview, setAsnPreview] = useState<{ type: 'VDA4913' | 'DESADV', content: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const exportLabelsToPDF = async () => {
    if (!shipment) return;
    
    setIsExporting(true);
    
    try {
      const labelElements = labelRefs.current.filter(el => el !== null);
      
      if (labelElements.length === 0) {
        alert('Etiket bulunamadı!');
        setIsExporting(false);
        return;
      }

      // Create single PDF with A4 landscape pages
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      for (let i = 0; i < labelElements.length; i++) {
        const element = labelElements[i];
        if (!element) continue;
        
        // Capture the label as high-quality image
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: element.offsetWidth,
          height: element.offsetHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Add new page for each label after the first
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate dimensions to fit the page while maintaining aspect ratio
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        
        const scaledWidth = imgWidth * ratio * 0.95; // 95% to add some margin
        const scaledHeight = imgHeight * ratio * 0.95;
        
        // Center the image on the page
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      }
      
      // Download the PDF
      pdf.save(`Labels_${shipment.deliveryNote}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      alert(`✓ ${labelElements.length} sayfalık PDF indirildi!`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsExporting(false);
    }
  };

  const previewASN = (type: 'VDA4913' | 'DESADV') => {
      if (!shipment) return;
      
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
      setAsnPreview({ type, content });
  };

  const downloadASN = () => {
      if (!asnPreview || !shipment) return;
      
      const blob = new Blob([asnPreview.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = asnPreview.type === 'VDA4913' 
          ? `VDA4913_${shipment.deliveryNote}.txt` 
          : `DESADV_${shipment.deliveryNote}.edi`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAsnPreview(null);
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
                 <button 
                    onClick={() => previewASN('VDA4913')} 
                    className="flex items-center px-3 py-2 border border-slate-300 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                 >
                    <Eye className="w-4 h-4 mr-2" />
                    VDA 4913
                 </button>
                 <button 
                    onClick={() => previewASN('DESADV')} 
                    className="flex items-center px-3 py-2 border border-slate-300 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                 >
                    <Eye className="w-4 h-4 mr-2" />
                    DESADV
                 </button>
                 <button 
                    onClick={exportLabelsToPDF} 
                    disabled={isExporting}
                    className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm disabled:bg-slate-400"
                 >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'İndiriliyor...' : 'PDF İndir'}
                 </button>
                 <button 
                    onClick={handlePrint} 
                    className="flex items-center px-3 py-2 border border-slate-300 bg-white text-slate-700 text-sm rounded-lg hover:bg-slate-50"
                 >
                    <Printer className="w-4 h-4 mr-2" />
                    Yazdır
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
                        <div 
                          key={hu.id} 
                          ref={el => labelRefs.current[index] = el}
                          className="mb-8 print:mb-0 print:break-after-page shadow-2xl print:shadow-none"
                        >
                            <LabelPreview data={labelData} type={LabelType.VDA_4902} />
                            <div className="text-center mt-2 text-xs text-slate-500 font-mono no-print">
                                Etiket {index + 1} / {shipment.handlingUnits.length}
                            </div>
                        </div>
                    );
                })}
            </div>
       </div>

       {/* ASN Preview Modal */}
       {asnPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-brand-600" />
                {asnPreview.type === 'VDA4913' ? 'VDA 4913' : 'EDIFACT DESADV'} Önizleme
              </h3>
              <button 
                onClick={() => setAsnPreview(null)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <pre className="bg-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-200">
                {asnPreview.content}
              </pre>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                {asnPreview.content.split('\n').length} satır
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(asnPreview.content);
                    alert('✓ Panoya kopyalandı!');
                  }}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Panoya Kopyala
                </button>
                <button 
                  onClick={downloadASN}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
