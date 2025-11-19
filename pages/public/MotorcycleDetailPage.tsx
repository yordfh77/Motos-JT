

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


const MotorcycleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [moto, setMoto] = useState<Motorcycle | null>(null);
    const [relatedMotos, setRelatedMotos] = useState<Motorcycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

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
                            <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden mb-4 shadow-md">
                                <img src={moto.imagenes[activeImageIndex] || 'https://picsum.photos/800/600'} alt={`${moto.nombre} ${activeImageIndex + 1}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform" />
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
                            <span className="bg-blue-100 text-brand-blue text-sm font-semibold px-3 py-1 rounded-full">{moto.categoria}</span>
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
        </PublicLayout>
    );
};

export default MotorcycleDetailPage;
