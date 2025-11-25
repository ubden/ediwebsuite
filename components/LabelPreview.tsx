import React from 'react';
import { LabelFormData, LabelType } from '../types';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';

interface LabelPreviewProps {
  data: LabelFormData;
  type: LabelType;
}

// Helper for VDA Field Headers (Tiny text top left of box)
const FieldHeader = ({ title, code }: { title: string, code?: string }) => (
  <div className="text-[7px] leading-[8px] uppercase font-bold text-slate-700 mb-0.5">
    {title} {code && <span className="ml-1">({code})</span>}
  </div>
);

// Standard Barcode Configuration
const barcodeConfig = {
  width: 1.5,
  height: 40,
  fontSize: 12,
  margin: 0,
  displayValue: false, // We usually print value manually in VDA to control formatting
  format: "CODE39" as const,
  renderer: "img" as const
};

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, type }) => {
  const isGTL = type === LabelType.GTL;
  
  // Determine Size
  const width = "793px"; // approx A5 width in pixels at 96dpi
  const height = "559px"; // approx A5 height

  // VDA 4902 / 4906 Layout
  const renderClassicVDA = () => (
    <div id="printable-label" className="bg-white border-2 border-black box-border relative text-black font-sans overflow-hidden" style={{ width, height }}>
      
      {/* ROW 1: Receiver & Dock */}
      <div className="flex h-[15%] border-b-2 border-black">
        <div className="w-[55%] border-r-2 border-black p-2 flex flex-col">
          <FieldHeader title="Warenempfänger" />
          <div className="text-sm font-bold leading-tight">{data.receiverName}</div>
          <div className="text-xs">{data.receiverLocation}</div>
        </div>
        <div className="w-[45%] p-2 flex flex-col justify-between">
          <FieldHeader title="Abladestelle/Lagerort" />
          <div className="text-4xl font-bold text-center tracking-tighter">{data.dockCode}</div>
        </div>
      </div>

      {/* ROW 2: Delivery Note & Supplier No */}
      <div className="flex h-[18%] border-b-2 border-black">
        <div className="w-[55%] border-r-2 border-black p-1 flex flex-col">
          <FieldHeader title="Lieferschein-Nr." code="N" />
          <div className="flex items-center space-x-2 h-full">
            <span className="text-xl font-bold font-mono z-10">{data.deliveryNote}</span>
            <div className="flex-1 overflow-hidden relative h-[40px] flex items-center">
               <div className="absolute top-0 left-0 transform origin-top-left scale-90">
                 <Barcode {...barcodeConfig} value={`N${data.deliveryNote}`} height={35} width={1.2} />
               </div>
            </div>
          </div>
        </div>
        <div className="w-[45%] p-1 flex flex-col">
          <FieldHeader title="Lieferanten-Nr." code="V" />
          <div className="flex items-center space-x-2 h-full">
            <span className="text-xl font-bold font-mono z-10">{data.supplierId}</span>
            <div className="flex-1 overflow-hidden relative h-[40px] flex items-center">
               <div className="absolute top-0 left-0 transform origin-top-left scale-90">
                  <Barcode {...barcodeConfig} value={`V${data.supplierId}`} height={35} width={1.2} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Part Number (The most important part) */}
      <div className="h-[22%] border-b-2 border-black p-2 flex flex-col justify-center">
         <div className="flex justify-between items-start">
            <FieldHeader title="Sach-Nr. Kunde" code="P" />
            <span className="text-xs font-bold text-slate-500">{type === LabelType.VDA_4906 ? 'MASTER LABEL' : ''}</span>
         </div>
         <div className="flex items-center h-full">
            <div className="text-5xl font-black tracking-tighter mr-4 font-vda z-10 whitespace-nowrap">{data.partNo}</div>
            <div className="flex-1 pt-2 relative h-[70px] overflow-hidden">
               <div className="absolute top-0 left-0">
                  <Barcode {...barcodeConfig} value={`P${data.partNo}`} height={60} width={1.7} />
               </div>
            </div>
         </div>
      </div>

      {/* ROW 4: Quantity & Description */}
      <div className="flex h-[15%] border-b-2 border-black">
         <div className="w-[30%] border-r-2 border-black p-1 flex flex-col">
            <FieldHeader title="Menge" code="Q" />
            <div className="flex flex-col h-full relative">
               <span className="text-3xl font-bold z-10">{data.quantity}</span>
               <div className="overflow-hidden absolute bottom-0 w-full h-[35px]">
                 <Barcode {...barcodeConfig} value={`Q${data.quantity}`} height={30} width={1.2} />
               </div>
            </div>
         </div>
         <div className="w-[70%] p-2 flex flex-col">
            <FieldHeader title="Bezeichnung Lieferung" />
            <div className="text-xl font-bold leading-6 mt-1 line-clamp-2">{data.description}</div>
         </div>
      </div>

      {/* ROW 5: Supplier & Date & Serial */}
      <div className="flex h-[15%] border-b-2 border-black">
          <div className="w-[55%] border-r-2 border-black flex">
             <div className="w-1/2 p-1 border-r border-black">
                <FieldHeader title="Lieferant" />
                <div className="text-xs font-bold leading-tight mt-1">{data.supplierName}</div>
             </div>
             <div className="w-1/2 p-1 flex flex-col">
                <FieldHeader title="Datum" />
                <span className="text-lg font-bold">{data.date}</span>
             </div>
          </div>
          <div className="w-[45%] p-1 flex flex-col">
             <FieldHeader title="Packstück-Nr." code="S" />
             <div className="flex justify-between items-center h-full relative">
                <span className="text-lg font-bold z-10">{data.serialNo}</span>
                <div className="absolute right-0 top-1 h-[40px] overflow-hidden flex items-center">
                   <Barcode {...barcodeConfig} value={`S${data.serialNo}`} height={35} width={1.2} />
                </div>
             </div>
          </div>
      </div>

      {/* ROW 6: Batch / Misc */}
      <div className="flex h-[15%]">
         <div className="w-[55%] border-r-2 border-black p-1">
             <FieldHeader title="Chargen-Nr." code="H" />
             <div className="flex items-center space-x-2 h-full relative">
                <span className="text-lg font-bold z-10">{data.batch}</span>
                <div className="absolute right-0 top-0 h-[40px] w-[180px] overflow-hidden">
                   <Barcode {...barcodeConfig} value={`H${data.batch}`} height={35} width={1.2} />
                </div>
             </div>
         </div>
         <div className="w-[20%] border-r-2 border-black p-1">
             <FieldHeader title="Gewicht Netto" />
             <span className="text-xl font-bold">{data.netWeight} <span className="text-sm">kg</span></span>
         </div>
         <div className="w-[25%] p-1">
             <FieldHeader title="Gewicht Brutto" />
             <span className="text-xl font-bold">{data.grossWeight} <span className="text-sm">kg</span></span>
         </div>
      </div>
    </div>
  );

  // Global Transport Label (GTL) Layout - Uses DataMatrix and Code128
  const renderGTL = () => (
    <div id="printable-label" className="bg-white border-2 border-black box-border relative text-black font-sans overflow-hidden" style={{ width, height }}>
      {/* Header */}
      <div className="flex h-[15%] border-b border-black">
         <div className="w-1/2 border-r border-black p-2">
            <FieldHeader title="Ship From" />
            <div className="text-xs font-bold">{data.supplierName}</div>
            <div className="text-xs">{data.supplierId}</div>
         </div>
         <div className="w-1/2 p-2">
            <FieldHeader title="Ship To" />
            <div className="text-sm font-bold">{data.receiverName}</div>
            <div className="text-xs">{data.receiverLocation}</div>
         </div>
      </div>

      {/* Doc Numbers */}
      <div className="flex h-[15%] border-b border-black">
          <div className="w-1/3 border-r border-black p-2">
             <FieldHeader title="Delivery Note Number" />
             <span className="text-lg font-bold">{data.deliveryNote}</span>
          </div>
          <div className="w-2/3 p-2 flex items-center justify-between">
              <div>
                <FieldHeader title="Customer Reference" />
                <span className="text-xl font-bold">{data.dockCode}</span>
              </div>
              {/* GTL requires DataMatrix (simulated with QR for now or use datamatrix lib if available, keeping QR as placeholder for 2D) */}
              <div className="border border-black p-1">
                 <QRCode value={`[)>06P${data.partNo}Q${data.quantity}V${data.supplierId}S${data.serialNo}`} size={60} />
              </div>
          </div>
      </div>

      {/* Part No */}
      <div className="h-[25%] border-b border-black p-2">
         <FieldHeader title="Customer Part Number" />
         <div className="text-5xl font-black text-center mt-2">{data.partNo}</div>
         <div className="flex justify-center mt-2">
            {/* GTL usually prefers Code 128 */}
            <Barcode value={data.partNo} format="CODE128" height={40} width={2} displayValue={false} />
         </div>
      </div>

      {/* Qty & Description */}
      <div className="flex h-[20%] border-b border-black">
          <div className="w-[25%] border-r border-black p-2">
             <FieldHeader title="Quantity" />
             <div className="text-3xl font-bold text-center mt-2">{data.quantity}</div>
             <div className="text-center text-xs">PCE</div>
          </div>
          <div className="w-[75%] p-2">
             <FieldHeader title="Part Description" />
             <div className="text-xl font-bold mt-2">{data.description}</div>
          </div>
      </div>

      {/* License Plate / Package ID */}
      <div className="h-[25%] p-2 flex flex-col justify-center items-center">
          <FieldHeader title="Package ID (License Plate)" />
          <div className="text-2xl font-bold mb-1">{data.packageId || `UN ${data.supplierId} ${data.serialNo}`}</div>
          <Barcode value={data.packageId || `UN${data.supplierId}${data.serialNo}`} format="CODE128" height={60} width={2} />
      </div>
    </div>
  );

  // VDA 4994 (Document Label)
  const renderVDA4994 = () => (
    <div id="printable-label" className="bg-white border-2 border-black box-border relative text-black font-sans overflow-hidden" style={{ width, height }}>
       <div className="p-2 border-b border-black bg-slate-100">
          <h2 className="text-center font-bold text-xl">TRANSPORT LABEL / SENDUNGSBELEG (VDA 4994)</h2>
       </div>
       <div className="flex h-[20%] border-b border-black">
          <div className="w-1/2 border-r border-black p-2">
             <FieldHeader title="Carrier / Spediteur" />
             <div className="text-2xl font-bold">DHL LOGISTICS</div>
          </div>
          <div className="w-1/2 p-2">
             <FieldHeader title="Transport Mode" />
             <div className="text-2xl font-bold">TRUCK / LKW</div>
          </div>
       </div>
       <div className="h-[40%] border-b border-black p-4 text-center">
           <FieldHeader title="Shipment ID / Sendungs-Nr." />
           <div className="text-5xl font-bold mt-4">{data.deliveryNote}99</div>
           <div className="flex justify-center mt-4">
               <Barcode value={data.deliveryNote + "99"} format="CODE128" height={80} width={2} />
           </div>
       </div>
       <div className="flex flex-1">
           <div className="w-1/2 border-r border-black p-2">
              <FieldHeader title="Place of Loading" />
              <div className="text-xl font-bold">{data.supplierName}</div>
              <div>{data.date}</div>
           </div>
           <div className="w-1/2 p-2">
              <FieldHeader title="Place of Discharge" />
              <div className="text-xl font-bold">{data.receiverName}</div>
              <div>{data.receiverLocation}</div>
           </div>
       </div>
    </div>
  );

  if (type === LabelType.VDA_4906) {
      // 4906 is similar to 4902 but with master logic, reusing 4902 structure for now with "M" code logic adjustment if needed.
      // But visually the user wants the "Master" look.
      return renderClassicVDA(); 
  }

  if (type === LabelType.GTL) return renderGTL();
  if (type === LabelType.VDA_4994) return renderVDA4994();

  // Default to 4902
  return renderClassicVDA();
};