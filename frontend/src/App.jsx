import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import ProblemPage from './pages/ProblemPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }
    
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// App Content
const AppContent = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/problem/:id" 
                    element={
                        <ProtectedRoute>
                            <ProblemPage />
                        </ProtectedRoute>
                    } 
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
};

// Main App Component
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
