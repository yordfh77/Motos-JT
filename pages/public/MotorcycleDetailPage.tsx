
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '../../services/supabaseClient';
import { Motorcycle } from '../../types';
import { Spinner } from '../../components/Spinner';
import { CONTACT_WHATSAPP_LINK, CONTACT_TELEGRAM_LINK, CONTACT_PHONE_NUMBER } from '../../constants';

// Full Screen Image Viewer Component
const Lightbox: React.FC<{ 
    isOpen: boolean; 
    images: string[]; 
    initialIndex: number; 
    onClose: () => void;
}> = ({ isOpen, images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsZoomed(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
             document.body.style.overflow = 'auto';
        };
    }, [isOpen, initialIndex]);

    if (!isOpen) return null;

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const toggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsZoomed(!isZoomed);
    };

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center transition-opacity duration-300"
            onClick={onClose}
        >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-4xl z-[110] hover:text-gray-300 focus:outline-none"
            >
                &times;
            </button>

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img 
                    src={images[currentIndex]} 
                    alt={`Zoomed ${currentIndex}`} 
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 ease-in-out cursor-zoom-in ${isZoomed ? 'scale-150 cursor-zoom-out' : ''}`}
                    onClick={toggleZoom}
                    style={{ transform: isZoomed ? 'scale(2)' : 'scale(1)' }}
                />
            </div>

            {images.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-[110]"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-[110]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm font-medium z-[110]">
                        {currentIndex + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
};

// Chain Pattern Component for Ficha Técnica
const ChainPattern: React.FC = () => (
    <div className="w-full h-6 opacity-40 overflow-hidden flex items-center justify-center mb-2">
         <div className="w-full h-full" style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='20' viewBox='0 0 60 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='2' y='5' width='25' height='10' rx='5' ry='5' fill='none' stroke='%23000' stroke-width='2'/%3E%3Crect x='32' y='5' width='25' height='10' rx='5' ry='5' fill='none' stroke='%23000' stroke-width='2'/%3E%3Cline x1='22' y1='10' x2='37' y2='10' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E")`,
             backgroundRepeat: 'repeat-x',
             backgroundSize: '40px 20px'
         }}></div>
    </div>
);

const MotorcycleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [moto, setMoto] = useState<Motorcycle | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchMoto = async () => {
            if (!id) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('motos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error al cargar la moto:', error);
                setMoto(null);
            } else {
                setMoto(data as Motorcycle);
            }
            setLoading(false);
            setActiveImageIndex(0);
            window.scrollTo(0, 0);
        };
        fetchMoto();
    }, [id]);

    if (loading) {
        return <PublicLayout><div className="flex justify-center items-center h-[80vh]"><Spinner /></div></PublicLayout>;
    }

    if (!moto) {
        return <PublicLayout><div className="text-center py-20"><h2 className="text-2xl">Motocicleta no encontrada</h2></div></PublicLayout>;
    }

    const whatsappMessage = `Hola, estoy interesado en la moto ${moto.nombre}. ¿Me puedes dar más detalles y precio final?`;

    // Order of fields as requested from the admin panel
    const fichaTecnicaOrder = [
        { key: 'cilindrada', label: 'Cilindrada' },
        { key: 'autonomia', label: 'Autonomía' },
        { key: 'velocidad', label: 'Velocidad Max' },
        { key: 'transmision', label: 'Transmisión' },
        { key: 'cap_combustible', label: 'Cap Combustible' },
        { key: 'motor', label: 'Motor' },
    ];

    return (
        <PublicLayout>
            <div className="relative min-h-screen bg-white overflow-hidden font-sans">
                
                {/* Decorative Top Right Shapes (Cyan/Black Triangle) */}
                <div className="absolute top-0 right-0 z-0 pointer-events-none hidden lg:block">
                     <div className="w-0 h-0 border-t-[200px] border-r-[200px] border-t-transparent border-r-cyan-400 absolute top-0 right-0 opacity-80"></div>
                     <div className="w-32 h-32 bg-black absolute top-0 right-0 clip-triangle-corner"></div>
                     {/* Checkered pattern simulation */}
                     <div className="absolute top-4 right-4 w-16 h-16 opacity-30 grid grid-cols-4 gap-0.5">
                        {[...Array(16)].map((_,i) => <div key={i} className={`w-full h-full ${i%2===0?'bg-white':'bg-black'}`}></div>)}
                     </div>
                </div>

                {/* --- HEADER SECTION --- */}
                <div className="relative z-10 container mx-auto pt-6 px-4">
                    <div className="flex flex-col items-start space-y-2">
                        {/* Availability Badge */}
                        <div className={`inline-block transform -skew-x-12 shadow-lg ${moto.disponible ? 'bg-[#00bfa5]' : 'bg-red-600'}`}>
                            <span className="block transform skew-x-12 px-6 py-1 text-white font-black italic uppercase tracking-wider text-lg">
                                {moto.disponible ? 'DISPONIBLE' : 'AGOTADO'}
                            </span>
                        </div>
                        
                        {/* Brand Logo (Text styled as logo) */}
                        <h1 className="text-5xl md:text-6xl font-black italic text-[#002d40] uppercase tracking-tight" style={{WebkitTextStroke: '1px transparent'}}>
                            {moto.categoria}
                        </h1>
                    </div>
                </div>

                {/* --- MAIN PRODUCT DISPLAY --- */}
                <div className="relative z-10 container mx-auto px-4 mt-8 lg:mt-4">
                    <div className="flex flex-col lg:flex-row items-center justify-center">
                        
                        {/* Left: Motorcycle Image */}
                        <div className="w-full lg:w-7/12 relative mb-8 lg:mb-0">
                             <div 
                                className="relative w-full aspect-[4/3] cursor-zoom-in group transition-transform duration-500 hover:scale-105"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                <img 
                                    src={moto.imagenes[activeImageIndex] || 'https://picsum.photos/800/600'} 
                                    alt={moto.nombre} 
                                    className="w-full h-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)]" 
                                />
                                 {/* Mini gallery thumbs */}
                                {moto.imagenes.length > 1 && (
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 p-2 bg-white/50 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {moto.imagenes.map((_, idx) => (
                                            <div key={idx} className={`w-2 h-2 rounded-full ${idx === activeImageIndex ? 'bg-black' : 'bg-gray-400'}`}></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: "Has tu pedido!" + Price */}
                        <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left relative">
                            
                            {/* Outline Text "Has tu pedido!" */}
                            <h2 
                                className="text-5xl md:text-7xl font-black italic uppercase leading-none mb-2 select-none"
                                style={{ 
                                    color: 'transparent', 
                                    WebkitTextStroke: '2px #000',
                                    fontFamily: 'Arial, sans-serif' // Force a standard bold font
                                }}
                            >
                                Has tu <br className="hidden lg:block"/>pedido!
                            </h2>
                            
                            {/* Model Name */}
                            <h3 className="text-4xl md:text-5xl font-black text-[#00bfa5] italic uppercase tracking-tighter mb-4 drop-shadow-sm">
                                {moto.nombre}
                            </h3>

                            {/* Price Section */}
                            <div className="flex flex-col items-center lg:items-start">
                                <div className="flex items-start">
                                    <span className="text-3xl text-red-600 font-bold mt-2 mr-1">$</span>
                                    <span className="text-7xl md:text-8xl font-black text-red-600 italic tracking-tighter leading-none drop-shadow-md">
                                        {moto.precio.toLocaleString()}
                                    </span>
                                </div>
                                <span className="text-gray-800 font-bold italic text-lg mt-1">
                                    + aranceles/impuestos
                                </span>
                            </div>
                            
                            {/* CTAs */}
                            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                                <a href={`${CONTACT_WHATSAPP_LINK}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-bold italic py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.166l-1.29 4.721 4.833-1.274z" /></svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- WAVE SEPARATOR --- */}
                <div className="relative -mb-1 mt-12 z-20">
                     <svg className="w-full h-16 md:h-32" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#00332a" fillOpacity="1" d="M0,160L60,160C120,160,240,160,360,144C480,128,600,96,720,112C840,128,960,192,1080,202.7C1200,213,1320,171,1380,149.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>

                {/* --- DARK GREEN SECTION (FICHA TECNICA) --- */}
                <div className="bg-[#00332a] pt-4 pb-12 text-white relative z-20">
                    <div className="container mx-auto px-4">
                        
                        {/* Ficha Técnica Title with Chain */}
                        <div className="flex flex-col items-center mb-8">
                            <h3 className="text-4xl md:text-5xl font-black italic uppercase text-gray-300 tracking-wider mb-2 drop-shadow-md">
                                Ficha Técnica
                            </h3>
                            {/* Chain Graphic Simulation */}
                            <div className="w-full max-w-md h-8 flex items-center justify-center opacity-50">
                                <div className="w-full h-full" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='20' viewBox='0 0 60 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='5' y='6' width='20' height='8' rx='3' stroke='%239ca3af' stroke-width='2' fill='none'/%3E%3Crect x='35' y='6' width='20' height='8' rx='3' stroke='%239ca3af' stroke-width='2' fill='none'/%3E%3Cline x1='25' y1='10' x2='35' y2='10' stroke='%239ca3af' stroke-width='2'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'repeat-x'
                                }}></div>
                            </div>
                        </div>

                        {/* Specs Grid - Right Aligned & Styled */}
                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-1 gap-6">
                             {fichaTecnicaOrder.map(({ key, label }) => {
                                const value = moto.especificaciones?.[key];
                                if (!value) return null;
                                return (
                                    <div key={key} className="flex flex-row justify-end items-baseline border-b border-[#1a5c50] pb-2">
                                        <span className="text-[#00bfa5] font-bold italic uppercase text-xl md:text-2xl mr-4 text-right flex-1">
                                            {label}:
                                        </span>
                                        <span className="text-2xl md:text-3xl font-black italic text-white tracking-wide">
                                            {value}
                                        </span>
                                    </div>
                                );
                            })}
                            
                            {/* Extra specs */}
                            {moto.especificaciones && Object.entries(moto.especificaciones)
                                .filter(([key]) => !fichaTecnicaOrder.map(f => f.key).includes(key))
                                .map(([key, value]) => value && (
                                    <div key={key} className="flex flex-row justify-end items-baseline border-b border-[#1a5c50] pb-2">
                                        <span className="text-[#00bfa5] font-bold italic uppercase text-xl md:text-2xl mr-4 text-right flex-1">
                                            {key}:
                                        </span>
                                        <span className="text-2xl md:text-3xl font-black italic text-white tracking-wide">
                                            {value}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                        
                        {/* Bottom Paint Splatter Effect (Optional visual) */}
                        <div className="absolute bottom-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
                             {/* Just some noise/grunge simulation via inline SVG or similar */}
                             <svg className="absolute -bottom-20 -left-20 w-96 h-96 text-black" viewBox="0 0 200 200" fill="currentColor">
                                 <path d="M45,-76.3C58.9,-69.3,71.4,-59.1,79.8,-46.8C88.2,-34.5,92.6,-20.1,89.9,-6.8C87.3,6.5,77.6,18.8,68.6,30.2C59.6,41.6,51.3,52.1,40.9,60.3C30.5,68.5,18,74.4,4.8,76.1C-8.4,77.8,-21.8,75.3,-34.6,69.1C-47.4,62.9,-59.6,53,-68.6,41C-77.6,29,-83.4,14.9,-83.1,0.9C-82.8,-13.1,-76.4,-27,-67,-38.4C-57.6,-49.8,-45.2,-58.7,-32.7,-66.4C-20.2,-74.1,-7.6,-80.6,3.8,-87.2L15.1,-93.8" transform="translate(100 100)" />
                             </svg>
                        </div>

                        {/* Footer Logos */}
                        <div className="mt-16 flex flex-col md:flex-row justify-between items-center border-t-2 border-[#1a5c50] pt-8">
                             <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                 <div className="bg-white p-2 rounded-full">
                                     <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-8 h-8"/>
                                 </div>
                                 <div className="text-left">
                                     <p className="text-[#00bfa5] font-bold uppercase text-sm">Contactar ahora</p>
                                     <p className="text-2xl font-black italic">{CONTACT_PHONE_NUMBER}</p>
                                 </div>
                             </div>
                             
                             <div className="flex items-center space-x-2">
                                 <span className="text-white font-black text-3xl italic">Ayocet /</span>
                                 <span className="text-[#00bfa5] font-black text-3xl italic">JT</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Component Instance */}
            <Lightbox 
                isOpen={isLightboxOpen} 
                images={moto.imagenes} 
                initialIndex={activeImageIndex} 
                onClose={() => setIsLightboxOpen(false)} 
            />
        </PublicLayout>
    );
};

export default MotorcycleDetailPage;
