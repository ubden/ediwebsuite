
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

// User & Auth
export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'ADMIN' | 'USER';
  avatar?: string;
  title?: string;
  phone?: string;
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
  contactPerson?: string;
  phone?: string;
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
  // Link back to Order Item if applicable
  orderItemId?: string;
  customerOrderNo?: string;
}

export interface Shipment {
  id: string;
  status: 'DRAFT' | 'COMPLETED' | 'SHIPPED';
  createdDate: string;
  shipmentNumber: string; // Friendly ID like SHP-2024-001
  
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
  
  relatedOrderId?: string; // Link to the source order
}

// --- ORDER MANAGEMENT INTERFACES ---

export interface OrderItem {
  id: string;
  partNo: string;
  description: string;
  orderQty: number;
  shippedQty: number; // How many already shipped
  unit: string; // PCE, KG, M
  deliveryDate: string; // Scheduled delivery
  customerOrderNo: string; // The PO number for this line
}

export interface Order {
  id: string;
  orderNumber: string; // Internal Reference
  customerCode: string; // Receiver ID
  supplierCode: string; // Supplier ID
  customerName: string;
  orderDate: string;
  type: 'VDA_4905' | 'DELFOR_D96A' | 'VDA_4984'; // EDI Standard Source
  status: 'OPEN' | 'PARTIAL' | 'COMPLETED';
  items: OrderItem[];
}

// Settings Interfaces
export interface SavedSupplier {
  id: string;
  name: string;
  supplierCode: string;
  address: string;
  country: string;
  taxId?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export interface SavedReceiver {
  id: string;
  name: string;
  plant: string;
  dockCode: string;
  lastSerialNo: number; // For auto-increment
  address: string;
  country: string;
  vatNumber?: string;
  contactPerson?: string;
  email?: string;
}

export interface SavedPart {
  id: string;
  partNo: string;
  description: string;
  defaultQty: string;
  netWeight: string;
  grossWeight: string;
  customsCode?: string; // HS Code
  originCountry?: string;
  shelfLife?: string; // Raf Ömrü (Days/Months)
  packagingCode?: string; // VDA Packaging Code (e.g. 4314)
  unNumber?: string; // Dangerous Goods UN Code
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
