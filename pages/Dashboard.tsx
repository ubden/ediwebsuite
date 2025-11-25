
import React, { useEffect, useState } from 'react';
import { MOCK_STATS, NAVIGATION_ITEMS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ClipboardList, TrendingUp } from 'lucide-react';
import { Order } from '../types';

const chartData = [
  { name: 'Pzt', etiket: 400, asn: 240 },
  { name: 'Sal', etiket: 300, asn: 139 },
  { name: 'Çar', etiket: 200, asn: 980 },
  { name: 'Per', etiket: 278, asn: 390 },
  { name: 'Cum', etiket: 189, asn: 480 },
  { name: 'Cmt', etiket: 239, asn: 380 },
  { name: 'Paz', etiket: 349, asn: 430 },
];

export const Dashboard: React.FC = () => {
  const [openOrderCount, setOpenOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
      // Calculate Stats from LocalStorage
      const orders: Order[] = JSON.parse(localStorage.getItem('vda_orders') || '[]');
      const open = orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIAL').length;
      setOpenOrderCount(open);
      setRecentOrders(orders.slice(-5).reverse());
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hoşgeldiniz, Ahmet Bey</h1>
          <p className="text-brand-100 max-w-xl">
            VDA standartlarında etiketleme, ASN ve Sipariş yönetim işlemlerinizi tek bir noktadan yönetin.
          </p>
          <div className="mt-6 flex space-x-3">
            <Link to="/orders/create" className="px-5 py-2.5 bg-white text-brand-600 font-semibold rounded-lg shadow hover:bg-brand-50 transition-colors flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              Sipariş Gir
            </Link>
            <Link to="/label/generator" className="px-5 py-2.5 bg-brand-800 bg-opacity-40 text-white font-semibold rounded-lg hover:bg-opacity-60 transition-colors backdrop-blur-sm">
              Hızlı Etiket
            </Link>
          </div>
        </div>
        <Zap className="absolute right-0 bottom-0 w-64 h-64 text-white opacity-10 transform translate-x-12 translate-y-12" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dynamic Open Order Stat */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Açık Siparişler</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{openOrderCount}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="font-medium text-orange-600">Aktif</span>
              <span className="text-slate-400 ml-2">işlem bekliyor</span>
            </div>
        </div>

        {MOCK_STATS.slice(0,3).map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-slate-500'}`}>
                {stat.change}
              </span>
              <span className="text-slate-400 ml-2">geçen haftaya göre</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List (New Feature) */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Son Sipariş Hareketleri</h3>
                    <Link to="/orders" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center">
                        Tümünü Gör <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Sipariş No</th>
                                    <th className="px-4 py-3">Müşteri</th>
                                    <th className="px-4 py-3">Tarih</th>
                                    <th className="px-4 py-3">Durum</th>
                                    <th className="px-4 py-3 rounded-r-lg">Kalem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900">{order.orderNumber}</td>
                                        <td className="px-4 py-3 text-slate-600">{order.customerName}</td>
                                        <td className="px-4 py-3 text-slate-500">{order.orderDate}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{order.items.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        Henüz sipariş kaydı yok.
                    </div>
                )}
            </div>

            {/* Volume Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Haftalık İşlem Hacmi</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="etiket" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="asn" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>

        {/* Quick Access Sidebar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit sticky top-24">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-brand-600" />
            Hızlı Erişim
          </h3>
          <div className="space-y-3">
             {NAVIGATION_ITEMS.filter(i => i.path !== '/').map((item) => (
                <Link key={item.path} to={item.path} className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-all group">
                    <div className="bg-slate-100 p-2 rounded-md group-hover:bg-white transition-colors">
                        <item.icon className="w-4 h-4 text-slate-600 group-hover:text-brand-600" />
                    </div>
                    <div className="ml-3 flex-1">
                        <h4 className="font-semibold text-sm text-slate-800">{item.name}</h4>
                    </div>
                </Link>
             ))}
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
             <h4 className="font-bold text-slate-800 text-sm mb-2">Sistem Duyurusu</h4>
             <p className="text-xs text-slate-500 leading-relaxed">
                VDA 4902 etiket formatında yeni güncellemeler yapılmıştır. Lütfen "Ayarlar" bölümünden müşteri tanımlarını kontrol ediniz.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
