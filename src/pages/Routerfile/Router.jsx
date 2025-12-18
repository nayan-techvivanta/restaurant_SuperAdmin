import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../auth/Login'
import Dashboard from '../main/Dashboard'
import Layout from '../../layouts/Layout'
import Restaurants from '../main/Restaurants'
import Users from '../main/Users'
import Analytics from '../main/Analytics'
import Settings from '../main/Settings'
import { ToastContainer } from 'react-toastify'

export default function AppRouter() {
  return (
    <Router>
      {/* <ToastContainer position="top-right" autoClose={1500} /> */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/restaurants" element={<Restaurants />} />
         <Route path="/users" element={<Users />} />
         <Route path="/analytics" element={<Analytics />} />
         <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}