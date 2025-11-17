import React, { ReactNode, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
// FIX: Import CONTACT_TELEGRAM_USER to resolve the undefined variable error.
import { CONTACT_WHATSAPP_LINK, CONTACT_TELEGRAM_LINK, CONTACT_PHONE_NUMBER, CONTACT_TELEGRAM_USER } from '../constants';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinkClasses = "text-gray-600 hover:text-brand-blue transition-colors duration-300 py-2 md:py-0";
    const activeNavLinkClasses = "text-brand-blue font-semibold";

    return (
        <header className="sticky top-0 z-50 glassmorphism shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="text-2xl font-bold text-gray-800">
                        Motos <span className="text-brand-blue">JT</span>
                    </Link>
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                    <nav className="hidden md:flex md:items-center md:space-x-8">
                        <NavLink to="/" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Inicio</NavLink>
                        <NavLink to="/catalogo" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Catálogo</NavLink>
                    </nav>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden bg-white/80 pb-4">
                    <nav className="flex flex-col items-center space-y-4">
                        <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Inicio</NavLink>
                        <NavLink to="/catalogo" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Catálogo</NavLink>
                    </nav>
                </div>
            )}
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
                <div className="text-lg font-bold">
                    Catalogo de Motos JT
                </div>
                <div className="flex flex-col items-center md:items-start space-y-2">
                    <h3 className="text-lg font-semibold mb-2">Contacto Directo</h3>
                    <a href={CONTACT_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-brand-blue transition-colors">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-6 w-6" />
                        <span>{CONTACT_PHONE_NUMBER}</span>
                    </a>
                    <a href={CONTACT_TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-brand-blue transition-colors">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="h-6 w-6" />
                        <span>{CONTACT_TELEGRAM_USER}</span>
                    </a>
                    <a href={`tel:${CONTACT_PHONE_NUMBER.replace(/\s/g, '')}`} className="flex items-center space-x-2 hover:text-brand-blue transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                        <span>Llamar: {CONTACT_PHONE_NUMBER}</span>
                    </a>
                </div>
            </div>
            <div className="text-center text-gray-400 mt-8 border-t border-gray-700 pt-4">
                &copy; {new Date().getFullYear()} Catalogo de Motos JT. Todos los derechos reservados.
                <span className="mx-2">|</span>
                <Link to="/admin/login" className="hover:text-brand-blue transition-colors">
                    Panel de Administrador
                </Link>
            </div>
        </div>
    </footer>
);

const FloatingWhatsAppButton: React.FC = () => (
    <a
        href={CONTACT_WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110 z-50"
        aria-label="Contactar por WhatsApp"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.166l-1.29 4.721 4.833-1.274z" />
        </svg>
    </a>
);


const PublicLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-brand-gray-100">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <FloatingWhatsAppButton />
        </div>
    );
};

export default PublicLayout;