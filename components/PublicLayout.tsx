
import React, { ReactNode, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CONTACT_WHATSAPP_LINK, CONTACT_FACEBOOK_LINK, CONTACT_PHONE_NUMBER, CONTACT_FACEBOOK_NAME } from '../constants';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinkClasses = "text-gray-700 hover:text-[#00bfa5] transition-colors duration-300 py-2 md:py-0 font-bold italic uppercase tracking-wide";
    const activeNavLinkClasses = "text-[#00bfa5]";

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    {/* Logo Image */}
                    <Link to="/" className="flex items-center group py-2">
                        <img 
                            src="logo.png" 
                            alt="Ayocet / JT" 
                            className="h-16 md:h-20 w-auto max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
                            onError={(e) => {
                                // Fallback text if image is missing
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        {/* Fallback Text (Hidden by default if image loads) */}
                        <div className="hidden flex items-center">
                            <span className="text-3xl font-black italic uppercase tracking-tight text-[#d946ef] pr-2">
                                Ayocet
                            </span>
                            <span className="text-3xl font-black italic uppercase tracking-tight text-[#00bfa5] ml-1 pr-2">
                                / JT
                            </span>
                        </div>
                    </Link>
                    
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 focus:outline-none">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-xl">
                    <nav className="flex flex-col items-center space-y-4 pt-4">
                        <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Inicio</NavLink>
                        <NavLink to="/catalogo" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Catálogo</NavLink>
                    </nav>
                </div>
            )}
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-[#002d40] text-white mt-auto relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d946ef] to-[#00bfa5]"></div>
        
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-8 md:space-y-0">
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center mb-4">
                        <span className="text-3xl font-black italic uppercase tracking-tight text-[#d946ef] drop-shadow-[0_0_5px_rgba(217,70,239,0.5)] pr-2">
                            Ayocet
                        </span>
                        <span className="text-3xl font-black italic uppercase tracking-tight text-[#00bfa5] ml-1 drop-shadow-[0_0_5px_rgba(0,191,165,0.5)] pr-2">
                            / JT
                        </span>
                    </div>
                    <p className="text-gray-300 max-w-xs italic">
                        La evolución en dos ruedas. Potencia, estilo y confianza en cada viaje.
                    </p>
                </div>
                
                <div className="flex flex-col items-center md:items-start space-y-4">
                    <h3 className="text-xl font-black italic uppercase text-white mb-2 tracking-wide border-b-2 border-[#d946ef] pb-1">Contacto</h3>
                    <a href={CONTACT_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 hover:text-[#00bfa5] transition-colors group">
                        <div className="bg-white/10 p-2 rounded-full group-hover:bg-[#00bfa5]/20 transition-colors">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-6 w-6" />
                        </div>
                        <span className="font-bold tracking-wide">Ayocet/JT</span>
                    </a>
                    <a href={CONTACT_FACEBOOK_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 hover:text-[#1877F2] transition-colors group">
                         <div className="bg-white/10 p-2 rounded-full group-hover:bg-[#1877F2]/20 transition-colors">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="h-6 w-6" />
                        </div>
                        <span className="font-bold tracking-wide">{CONTACT_FACEBOOK_NAME}</span>
                    </a>
                </div>
            </div>
            
            <div className="text-center text-gray-400 mt-12 border-t border-[#1a5c50] pt-6 flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm">&copy; {new Date().getFullYear()} Ayocet / JT. Todos los derechos reservados.</p>
                <Link to="/admin/login" className="mt-4 md:mt-0 text-sm font-bold text-[#d946ef] hover:text-white transition-colors uppercase tracking-wider">
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
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:bg-[#128C7E] transition-all transform hover:scale-110 hover:-translate-y-1 z-50 border-2 border-white"
        aria-label="Contactar por WhatsApp"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.166l-1.29 4.721 4.833-1.274z" />
        </svg>
    </a>
);


const PublicLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
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
