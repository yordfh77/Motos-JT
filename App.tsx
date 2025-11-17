
import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import MotorcycleDetailPage from './pages/public/MotorcycleDetailPage';
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import MotorcyclesListPage from './pages/admin/MotorcyclesListPage';
import MotorcycleFormPage from './pages/admin/MotorcycleFormPage';
import CategoriesListPage from './pages/admin/CategoriesListPage';
import AccountPage from './pages/admin/AccountPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const ProtectedAdminLayout = () => (
        <ProtectedRoute>
            <AdminLayout>
                <Outlet />
            </AdminLayout>
        </ProtectedRoute>
    );

    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalogo" element={<CatalogPage />} />
                    <Route path="/moto/:id" element={<MotorcycleDetailPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route
                        path="/admin"
                        element={<ProtectedAdminLayout />}
                    >
                        <Route index element={<DashboardPage />} />
                        <Route path="motos" element={<MotorcyclesListPage />} />
                        <Route path="motos/nueva" element={<MotorcycleFormPage />} />
                        <Route path="motos/editar/:id" element={<MotorcycleFormPage />} />
                        <Route path="categorias" element={<CategoriesListPage />} />
                        <Route path="cuenta" element={<AccountPage />} />
                    </Route>
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
}

export default App;