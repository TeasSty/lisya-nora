import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicSite } from './pages/PublicSite'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  )
}
