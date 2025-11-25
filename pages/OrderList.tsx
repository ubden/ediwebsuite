
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ArrowRight, Package, AlertCircle } from 'lucide-react';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage or load mock data
    const savedOrders = localStorage.getItem('vda_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Mock Data for demonstration if empty
      const mockData: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerCode: '987654321',
          customerName: 'Mayr Werke AG',
          supplierCode: '123456789',
          orderDate: '2024-03-20',
          type: 'VDA_4905',
          status: 'OPEN',
          items: [
            { id: '101', partNo: '765-HGD89-123', description: 'Befestigung XYZ Aluminium', orderQty: 5000, shippedQty: 0, unit: 'PCE', deliveryDate: '2024-03-25', customerOrderNo: 'PO-5510' },
            { id: '102', partNo: '888-ABC-99', description: 'Plastic Cover Type B', orderQty: 2000, shippedQty: 500, unit: 'PCE', deliveryDate: '2024-03-28', customerOrderNo: 'PO-5512' }
          ]
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerCode: '445566778',
          customerName: 'BMW Group Munich',
          supplierCode: '123456789',
          orderDate: '2024-03-21',
          type: 'DELFOR_D96A',
          status: 'PARTIAL',
          items: [
            { id: '201', partNo: '11-22-33-44', description: 'Engine Mount Bracket', orderQty: 1000, shippedQty: 800, unit: 'PCE', deliveryDate: '2024-04-01', customerOrderNo: '55000123' }
          ]
        }
      ];
      setOrders(mockData);
      localStorage.setItem('vda_orders', JSON.stringify(mockData));
    }
  }, []);

  const createShipment = (order: Order) => {
    navigate('/label/generator', { state: { order } });
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-800">Sipariş Yönetimi (EDI)</h1>
           <p className="text-slate-500 mt-2">VDA 4905, VDA 4984 ve DELFOR formatındaki müşteri siparişleri.</p>
        </div>
        <Link to="/orders/create" className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Sipariş Gir
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
         <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-2">Sipariş No</div>
            <div className="col-span-3">Müşteri</div>
            <div className="col-span-2">Tarih / Tip</div>
            <div className="col-span-2">Durum</div>
            <div className="col-span-1">Kalem</div>
            <div className="col-span-2 text-right">İşlem</div>
         </div>

         <div className="divide-y divide-slate-100">
            {orders.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Henüz açık sipariş bulunmamaktadır.
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                        <div className="col-span-2 font-medium text-slate-900">{order.orderNumber}</div>
                        <div className="col-span-3">
                            <div className="text-sm font-bold text-slate-800">{order.customerName}</div>
                            <div className="text-xs text-slate-500">{order.customerCode}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-sm text-slate-700">{order.orderDate}</div>
                            <div className="text-[10px] inline-block bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold mt-1">{order.type}</div>
                        </div>
                        <div className="col-span-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                order.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-slate-100 text-slate-800'
                            }`}>
                                {order.status === 'OPEN' ? 'Açık' : order.status === 'PARTIAL' ? 'Kısmi Sevk' : 'Tamamlandı'}
                            </span>
                        </div>
                        <div className="col-span-1 text-sm text-slate-600">
                            {order.items.length} Kalem
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button 
                                onClick={() => createShipment(order)}
                                className="flex items-center text-sm text-brand-600 hover:text-brand-800 font-medium px-3 py-1.5 border border-transparent hover:bg-brand-50 rounded transition-colors"
                            >
                                Sevkiyat Oluştur
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        
                        {/* Order Details Preview (Collapsed Logic could be added here) */}
                        <div className="col-span-12 pl-4 border-l-2 border-slate-200 mt-2">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between text-xs text-slate-500 py-1">
                                    <span className="font-mono">{item.partNo}</span>
                                    <span>{item.description}</span>
                                    <span className="font-medium">
                                        {item.shippedQty} / {item.orderQty} {item.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
};
