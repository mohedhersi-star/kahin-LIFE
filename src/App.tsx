import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import Islamic from './pages/Islamic';
import Journal from './pages/Journal';
import Fitness from './pages/Fitness';
import Water from './pages/Water';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="finance" element={<Finance />} />
          <Route path="goals" element={<Goals />} />
          <Route path="habits" element={<Habits />} />
          <Route path="islamic" element={<Islamic />} />
          <Route path="journal" element={<Journal />} />
          <Route path="fitness" element={<Fitness />} />
          <Route path="water" element={<Water />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
