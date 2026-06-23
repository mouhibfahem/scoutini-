import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import ScoutDashboard from './pages/ScoutDashboard';
import SearchTalents from './pages/SearchTalents';
import PlayerProfile from './pages/PlayerProfile';

import { API_BASE_URL } from './config';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('scoutini_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('scoutini_token');
      }
    } catch (err) {
      console.error('Erreur reconnexion auto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('scoutini_token');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D14] flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#070D14] text-white flex flex-col justify-between">
        <Navbar user={currentUser} onLogout={handleLogout} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} />} />
            
            <Route 
              path="/login" 
              element={currentUser ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            
            <Route 
              path="/register" 
              element={currentUser ? <Navigate to="/" /> : <Register onLoginSuccess={handleLoginSuccess} />} 
            />
            
            <Route path="/talents" element={<SearchTalents />} />
            <Route path="/players/:id" element={<PlayerProfile currentUser={currentUser} />} />

            {/* Dashboard Joueur */}
            <Route 
              path="/dashboard" 
              element={
                currentUser && currentUser.role === 'PLAYER' 
                  ? <PlayerDashboard /> 
                  : <Navigate to="/login" />
              } 
            />

            {/* Dashboard Scout/Club/Académie */}
            <Route 
              path="/scout-dashboard" 
              element={
                currentUser && currentUser.role !== 'PLAYER' 
                  ? <ScoutDashboard /> 
                  : <Navigate to="/login" />
              } 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
