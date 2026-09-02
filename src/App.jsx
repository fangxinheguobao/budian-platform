import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { ROLES } from './data/seed'
import Landing from './Landing'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Fabrics from './admin/Fabrics'
import FabricDetail from './admin/FabricDetail'
import Inventory from './admin/Inventory'
import Ebooks from './admin/Ebooks'
import EbookEditor from './admin/EbookEditor'
import Customers from './admin/Customers'
import Leads from './admin/Leads'
import Proofs from './admin/Proofs'
import AIStudio from './admin/AIStudio'
import Reports from './admin/Reports'
import SystemAdmin from './admin/SystemAdmin'
import Tags from './admin/Tags'

import ShopLayout from './shop/ShopLayout'
import ShopHome from './shop/Home'
import ShopFabrics from './shop/Fabrics'
import ShopFabricDetail from './shop/FabricDetail'
import Mall from './shop/Mall'
import MyProofs from './shop/MyProofs'
import EbookView from './shop/EbookView'

function Gate({ children }) {
  const { session, user } = useAuth()
  const loc = useLocation()
  if (!session || !user) return <Navigate to="/" replace state={{ from: loc.pathname }} />
  return children
}

export default function App() {
  const { session, user, logout } = useAuth()
  const home = user ? (ROLES[user.role]?.home || '/shop') : '/'
  return (
    <Routes>
      <Route path="/" element={session && user ? <Navigate to={home} replace /> : <Landing />} />
      <Route path="/admin" element={<Gate><AdminLayout /></Gate>}>
        <Route index element={<Dashboard />} />
        <Route path="fabrics" element={<Fabrics />} />
        <Route path="fabrics/:sku" element={<FabricDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="ebooks" element={<Ebooks />} />
        <Route path="ebooks/new" element={<EbookEditor />} />
        <Route path="ebooks/:id" element={<EbookEditor />} />
        <Route path="customers" element={<Customers />} />
        <Route path="leads" element={<Leads />} />
        <Route path="proofs" element={<Proofs />} />
        <Route path="ai-studio" element={<AIStudio />} />
        <Route path="reports" element={<Reports />} />
        <Route path="system" element={<SystemAdmin />} />
        <Route path="tags" element={<Tags />} />
      </Route>
      <Route path="/shop" element={<Gate><ShopLayout /></Gate>}>
        <Route index element={<ShopHome />} />
        <Route path="fabrics" element={<ShopFabrics />} />
        <Route path="fabrics/:sku" element={<ShopFabricDetail />} />
        <Route path="mall" element={<Mall />} />
        <Route path="proofs" element={<MyProofs />} />
      </Route>
      <Route path="/ebook/:id" element={<Gate><EbookView /></Gate>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
