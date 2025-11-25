import { AsnFormData, AsnItem } from '../types';

export const generateVDA4913 = (data: AsnFormData): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 8).replace(/-/g, '');
  
  // Mock VDA 4913 Structure (Simplified)
  // 711 Header
  // 712 Data Header
  // 713 Line Items
  // 719 Footer
  
  let content = `71101${data.supplierId.padEnd(9, ' ')}${data.customerId.padEnd(9, ' ')}${dateStr}\n`;
  content += `71201${data.deliveryNoteNumber.padEnd(8, ' ')}${data.transportMode}\n`;
  
  data.items.forEach((item, index) => {
    content += `71301${(index + 1).toString().padStart(3, '0')}${item.partNumber.padEnd(22, ' ')}${item.quantity.toString().padStart(13, '0')}${item.orderNumber.padEnd(15, ' ')}\n`;
  });
  
  content += `71901${(data.items.length + 2).toString().padStart(7, '0')}\n`;
  
  return content;
};

export const generateDESADV = (data: AsnFormData): string => {
  // Mock EDIFACT DESADV D96A Structure
  const unb = `UNB+UNOA:1+${data.supplierId}+${data.customerId}+${new Date().toISOString().replace(/[-T:]/g, '').slice(2, 12)}+1'`;
  const unh = `UNH+0001+DESADV:D:96A:UN'`;
  const bgm = `BGM+351+${data.deliveryNoteNumber}+9'`;
  const dtm = `DTM+137:${data.deliveryDate.replace(/-/g, '')}:102'`;
  
  let lines = '';
  data.items.forEach((item, index) => {
    lines += `LIN+${index + 1}++${item.partNumber}:IN'\nQTY+12:${item.quantity}:PCE'\n`;
  });
  
  const unt = `UNT+${5 + data.items.length * 2}+0001'`;
  const unz = `UNZ+1+1'`;
  
  return `${unb}\n${unh}\n${bgm}\n${dtm}\n${lines}${unt}\n${unz}`;
};