

import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        // 1. Navegar primero a la página pública
        navigate('/');
        // 2. Luego, cerrar la sesión en segundo plano
        await signOut();
    };

    const navLinkClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors";
    const activeNavLinkClasses = "bg-brand-blue text-white";

    const sidebarContent = (
        <>
            <div className="p-4">
                <h1 className="text-2xl font-bold text-white">Motos <span className="text-brand-blue">JT</span></h1>
                <p className="text-sm text-gray-400">Admin Panel</p>
            </div>
            <nav className="mt-8 px-4 space-y-2">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Resumen</NavLink>
                <NavLink to="/admin/motos" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Motos</NavLink>
                <NavLink to="/admin/categorias" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Categorías</NavLink>
                <NavLink to="/admin/cuenta" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Mi Cuenta</NavLink>
            </nav>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-30 transition-opacity bg-black bg-opacity-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
                {sidebarContent}
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-800">
                {sidebarContent}
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b">
                    <button className="text-gray-500 focus:outline-none lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </button>
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 hidden md:block">{user?.email}</span>
                         <a href="/#" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-blue hover:text-blue-700 transition-colors flex items-center space-x-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Ver Sitio Público</span>
                        </a>
                        <button onClick={handleSignOut} className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                            Cerrar Sesión
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;