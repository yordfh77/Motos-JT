


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '../../services/supabaseClient';
import { Motorcycle } from '../../types';
import { Spinner } from '../../components/Spinner';
import { CONTACT_WHATSAPP_LINK, CONTACT_TELEGRAM_LINK, CONTACT_PHONE_NUMBER } from '../../constants';

const MotorcycleCard: React.FC<{ moto: Motorcycle }> = ({ moto }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group">
        <div className="relative h-48">
            <img src={moto.imagenes[0] || 'https://picsum.photos/400/300'} alt={moto.nombre} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
            <p className="text-xs text-gray-500">{moto.categoria}</p>
            <h3 className="text-md font-bold text-gray-800 truncate">{moto.nombre}</h3>
            <p className="text-md font-semibold text-brand-blue mt-1">{moto.precio.toLocaleString('es-CU')} {moto.moneda}</p>
            <Link to={`/moto/${moto.id}`} className="block w-full text-center text-sm bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg mt-3 hover:bg-gray-300 transition-colors">
                Ver
            </Link>
        </div>
    </div>
);

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
            document.body.style.overflow = 'hidden'; // Prevent scrolling underneath
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
            className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center transition-opacity duration-300"
            onClick={onClose}
        >
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-4xl z-[70] hover:text-gray-300 focus:outline-none"
            >
                &times;
            </button>

            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img 
                    src={images[currentIndex]} 
                    alt={`Zoomed ${currentIndex}`} 
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 ease-in-out cursor-zoom-in ${isZoomed ? 'scale-150 cursor-zoom-out' : ''}`}
                    onClick={toggleZoom}
                    style={{ transform: isZoomed ? 'scale(2)' : 'scale(1)' }}
                />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-[70]"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-[70]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    
                    <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm font-medium z-[70]">
                        {currentIndex + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
};

const MotorcycleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [moto, setMoto] = useState<Motorcycle | null>(null);
    const [relatedMotos, setRelatedMotos] = useState<Motorcycle[]>([]);
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
                const fetchedMoto = data as Motorcycle;
                setMoto(fetchedMoto);

                // Fetch related motos
                const { data: relatedData, error: relatedError } = await supabase
                    .from('motos')
                    .select('*')
                    .eq('categoria', fetchedMoto.categoria)
                    .neq('id', fetchedMoto.id)
                    .eq('disponible', true)
                    .limit(4);
                
                if (!relatedError) {
                    setRelatedMotos(relatedData as Motorcycle[]);
                }
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

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Image Gallery */}
                        <div>
                            <div 
                                className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden mb-4 shadow-md cursor-zoom-in relative group"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                <img src={moto.imagenes[activeImageIndex] || 'https://picsum.photos/800/600'} alt={`${moto.nombre} ${activeImageIndex + 1}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        Clic para ampliar
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {moto.imagenes.map((imgUrl, index) => (
                                    <button key={index} onClick={() => setActiveImageIndex(index)} className={`rounded-lg overflow-hidden border-2 ${activeImageIndex === index ? 'border-brand-blue' : 'border-transparent'} transition-all`}>
                                        <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-20 object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Moto Info */}
                        <div>
                            <div className="flex justify-between items-start">
                                <span className="bg-blue-100 text-brand-blue text-sm font-semibold px-3 py-1 rounded-full">{moto.categoria}</span>
                                {moto.rating !== undefined && moto.rating > 0 && (
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill={star <= moto.rating! ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className={`w-5 h-5 ${star <= moto.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.326 1.163l-4.337 3.869a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.336-3.869a.562.562 0 01.326-1.164l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                            </svg>
                                        ))}
                                        <span className="text-sm text-gray-500">({moto.rating})</span>
                                    </div>
                                )}
                            </div>
                            
                            <h1 className="text-4xl font-extrabold text-gray-800 mt-3">{moto.nombre}</h1>
                            <p className="text-3xl font-bold text-brand-blue my-4">{moto.precio.toLocaleString('es-CU')} {moto.moneda}</p>
                            
                            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b pb-2">Descripción</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{moto.descripcion}</p>
                            
                            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b pb-2">Especificaciones Técnicas</h2>
                            <ul className="space-y-3 text-gray-700">
                                {moto.especificaciones && Object.entries(moto.especificaciones).map(([key, value]) => value && (
                                    <li key={key} className="flex justify-between items-center capitalize">
                                        <span className="font-semibold">{key.replace(/_/g, ' ')}:</span>
                                        <span className="text-right">{value}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10 p-6 bg-gray-50 rounded-xl border">
                                <h3 className="text-xl font-bold text-center mb-4">¿Interesado? ¡Contáctanos!</h3>
                                <div className="flex flex-col space-y-3">
                                    <a href={`${CONTACT_WHATSAPP_LINK}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-3 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors text-lg">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-6 w-6 mr-3" />
                                        Contactar por WhatsApp
                                    </a>
                                    <a href={CONTACT_TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-3 px-4 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-colors text-lg">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="h-6 w-6 mr-3" />
                                        Contactar por Telegram
                                    </a>
                                     <a href={`tel:${CONTACT_PHONE_NUMBER.replace(/\s/g, '')}`} className="flex items-center justify-center py-3 px-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-lg">
                                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                                        Llamar Ahora
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Models */}
                {relatedMotos.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Modelos Relacionados</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedMotos.map(relatedMoto => <MotorcycleCard key={relatedMoto.id} moto={relatedMoto} />)}
                        </div>
                    </div>
                )}
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