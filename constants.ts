
import { Box, Truck, Barcode, FileText, Home, Activity, Settings, ClipboardList, History } from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { name: 'Panel', path: '/', icon: Home },
  { name: 'Sipariş Yönetimi', path: '/orders', icon: ClipboardList },
  { name: 'Etiket Oluşturucu', path: '/label/generator', icon: Barcode },
  { name: 'Geçmiş Sevkiyatlar', path: '/shipments', icon: History },
  { name: 'VDA 4913 ASN', path: '/asn/vda4913', icon: FileText },
  { name: 'DESADV D96A', path: '/asn/desadv', icon: Truck },
  { name: 'Ayarlar', path: '/settings', icon: Settings },
];

export const MOCK_STATS = [
  { name: 'Günlük Etiket', value: '1,240', change: '+12%', icon: Barcode },
  { name: 'ASN Gönderimi', value: '86', change: '+4%', icon: FileText },
  { name: 'Bekleyen Sevkiyat', value: '12', change: '-2%', icon: Truck },
  { name: 'Sistem Durumu', value: '%99.9', change: 'Stable', icon: Activity },
];
