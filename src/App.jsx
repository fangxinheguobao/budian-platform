import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import ShopLayout from './shop/ShopLayout'
import Dashboard from './admin/Dashboard'
import Fabrics from './admin/Fabrics'
import FabricDetail from './admin/FabricDetail'
import Inventory from './admin/Inventory'
import Ebooks from './admin/Ebooks'
import EbookEditor from './admin/EbookEditor'
import Customers from './admin/Customers'
import SampleLists from './admin/SampleLists'
import Tags from './admin/Tags'
import Rehash from './admin/Rehash'
import Inquiries from './admin/Inquiries'

import ShopHome from './shop/Home'
import ShopFabrics from './shop/Fabrics'
import ShopFabricDetail from './shop/FabricDetail'
import Mall from './shop/Mall'
import MySamples from './shop/MySamples'
import EbookView from './shop/EbookView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="fabrics" element={<Fabrics />} />
        <Route path="fabrics/:sku" element={<FabricDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="ebooks" element={<Ebooks />} />
        <Route path="ebooks/new" element={<EbookEditor />} />
        <Route path="ebooks/:id" element={<EbookEditor />} />
        <Route path="customers" element={<Customers />} />
        <Route path="sample-lists" element={<SampleLists />} />
        <Route path="tags" element={<Tags />} />
        <Route path="rehash" element={<Rehash />} />
        <Route path="inquiries" element={<Inquiries />} />
      </Route>
      <Route path="/shop" element={<ShopLayout />}>
        <Route index element={<ShopHome />} />
        <Route path="fabrics" element={<ShopFabrics />} />
        <Route path="fabrics/:sku" element={<ShopFabricDetail />} />
        <Route path="mall" element={<Mall />} />
        <Route path="my-samples" element={<MySamples />} />
      </Route>
      <Route path="/ebook/:id" element={<EbookView />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
