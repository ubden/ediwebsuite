export enum LabelType {
  VDA_4902 = 'VDA_4902', // Standard Transport Label
  VDA_4906 = 'VDA_4906', // Master Label (Mixed Pallet)
  GTL = 'GTL',           // Global Transport Label (Odette)
  VDA_4994 = 'VDA_4994'  // Transport Document Label
}

export enum AsnType {
  VDA4913 = 'VDA4913',
  DESADV = 'DESADV_D96A'
}

// Validation Rules
export interface ValidationRule {
  maxLength: number;
  numericOnly?: boolean;
  required?: boolean;
}

export const VDA_RULES: Record<string, ValidationRule> = {
  supplierId: { maxLength: 9, numericOnly: true, required: true },
  customerId: { maxLength: 9, numericOnly: false, required: true },
  deliveryNote: { maxLength: 8, numericOnly: true, required: true },
  partNo: { maxLength: 22, required: true },
  quantity: { maxLength: 12, numericOnly: true, required: true },
  serialNo: { maxLength: 9, numericOnly: true, required: true },
  dockCode: { maxLength: 14, required: false },
};

// Core Entities
export interface Transporter {
  id: string;
  name: string;
  carrierCode: string; // SCAC or VDA code
}

export interface HandlingUnit {
  id: string; // Internal GUID
  serialNo: string; // The specific VDA serial (S)
  packageId?: string; // GTL License Plate (M/G)
  partNo: string;
  quantity: number;
  type: 'BOX' | 'PALLET';
  grossWeight: number;
  netWeight: number;
  batch: string;
  productionDate: string;
  parentHuId?: string; // If this box is on a pallet
}

export interface ShipmentItem {
  id: string;
  partNo: string;
  description: string;
  quantityPerPack: number;
  totalQuantity: number;
  packCount: number; // Calculated
  netWeightPerPack: number;
  grossWeightPerPack: number;
  batch: string;
  productionDate: string;
}

export interface Shipment {
  id: string;
  status: 'DRAFT' | 'COMPLETED';
  createdDate: string;
  
  // Header Info
  receiverId: string;
  supplierId: string;
  transporterId: string;
  deliveryNote: string;
  deliveryDate: string;
  
  // Data Snapshots (to preserve history even if settings change)
  receiverSnapshot: SavedReceiver;
  supplierSnapshot: SavedSupplier;
  transporterSnapshot: Transporter;
  
  items: ShipmentItem[];
  handlingUnits: HandlingUnit[]; // The generated labels
}

// Settings Interfaces
export interface SavedSupplier {
  id: string;
  name: string;
  supplierCode: string;
  address: string;
}

export interface SavedReceiver {
  id: string;
  name: string;
  plant: string;
  dockCode: string;
  lastSerialNo: number; // For auto-increment
}

export interface SavedPart {
  id: string;
  partNo: string;
  description: string;
  defaultQty: string;
  netWeight: string;
  grossWeight: string;
}

export interface LabelFormData {
  // Legacy support for single label preview
  receiverName: string;
  receiverLocation: string;
  dockCode: string;
  supplierName: string;
  supplierId: string;
  partNo: string;
  description: string;
  quantity: string;
  netWeight: string;
  grossWeight: string;
  date: string;
  batch: string;
  deliveryNote: string;
  serialNo: string;
  packageId: string;
}

export interface AsnItem {
  id: string;
  partNumber: string;
  quantity: number;
  orderNumber: string;
  packageType: string;
}

export interface AsnFormData {
  deliveryNoteNumber: string;
  deliveryDate: string;
  supplierId: string;
  customerId: string;
  transportMode: string;
  carrier: string;
  items: AsnItem[];
}