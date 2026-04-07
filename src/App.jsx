import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import PostShipmentPage from './pages/PostShipmentPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import TrackingPage from './pages/TrackingPage.jsx'
import TravelersPage from './pages/TravelersPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/travelers" element={<TravelersPage />} />
        <Route path="/post-shipment" element={<PostShipmentPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
