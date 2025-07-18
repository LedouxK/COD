import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Nous gardons App.css pour les animations mais utilisons Tailwind pour la majorité des styles

// Contexts
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { useAuth } from './context/AuthContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChatContainer from './components/chat/ChatContainer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Protected route wrapper
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center text-slate-500 dark:text-slate-400">Chargement...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={
            <RequireAuth>
              <ChatProvider>
                <ChatContainer />
              </ChatProvider>
            </RequireAuth>
          } />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
