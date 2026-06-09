import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Home from './pages/Home/Home'
import Auth from './pages/Auth/Auth'
import Dashboard from './pages/Dashboard/Dashboard'
import MyFiles from './pages/MyFiles/MyFiles'
import Upload from './pages/Upload/Upload'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings/Settings'
import Downloads from './pages/Downloads/Downloads'
import MyShares from './pages/MyShares/MyShares'
import AccessFile from './pages/AccessFile/AccessFile'
import Contact from './pages/Contact/Contact'
import FAQ from './pages/FAQ/FAQ'
import Help from './pages/Help/Help'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<Help />} />
          <Route path="/access" element={<AccessFile />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-files" element={<ProtectedRoute><MyFiles /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
          <Route path="/my-shares" element={<ProtectedRoute><MyShares /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
