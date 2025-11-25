
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LabelGenerator } from './pages/LabelGenerator';
import { AsnGenerator } from './pages/AsnGenerator';
import { Settings } from './pages/Settings';
import { OrderList } from './pages/OrderList';
import { OrderCreate } from './pages/OrderCreate';
import { ShipmentList } from './pages/ShipmentList';
import { ShipmentDetail } from './pages/ShipmentDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { AsnType } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/create" element={<OrderCreate />} />
            
            <Route path="label/generator" element={<LabelGenerator />} />
            <Route path="shipments" element={<ShipmentList />} />
            <Route path="shipments/:id" element={<ShipmentDetail />} />
            
            <Route path="asn/vda4913" element={<AsnGenerator type={AsnType.VDA4913} />} />
            <Route path="asn/desadv" element={<AsnGenerator type={AsnType.DESADV} />} />
            
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
