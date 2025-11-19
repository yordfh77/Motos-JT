


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '../../services/supabaseClient';
import { Motorcycle, Category } from '../../types';
import { Spinner } from '../../components/Spinner';

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center space-x-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={star <= rating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.326 1.163l-4.337 3.869a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.336-3.869a.562.562 0 01.326-1.164l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
            ))}
            <span className="text-xs text-gray-400 ml-1">({rating})</span>
        </div>
    );
};

const MotorcycleCard: React.FC<{ moto: Motorcycle }> = ({ moto }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
        <div className="relative h-56">
            <img src={moto.imagenes[0] || 'https://picsum.photos/400/300'} alt={moto.nombre} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors duration-300"></div>
            {moto.destacada && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Destacada</span>
            )}
        </div>
        <div className="p-5">
            <div className="flex justify-between items-start">
                <p className="text-sm text-gray-500 mb-1">{moto.categoria}</p>
                {moto.rating !== undefined && moto.rating > 0 && (
                    <StarDisplay rating={moto.rating} />
                )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 truncate">{moto.nombre}</h3>
            <p className="text-lg font-semibold text-brand-blue mt-2">{moto.precio.toLocaleString('es-CU')} {moto.moneda}</p>
            <Link to={`/moto/${moto.id}`} className="block w-full text-center bg-gray-800 text-white font-semibold py-2.5 rounded-lg mt-4 hover:bg-brand-blue transition-colors duration-300">
                Ver Detalles
            </Link>
        </div>
    </div>
);


const HomePage: React.FC = () => {
    const [featuredMotos, setFeaturedMotos] = useState<Motorcycle[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            const { data: motosData, error: motosError } = await supabase
                .from('motos')
                .select('*')
                .eq('disponible', true)
                .eq('destacada', true)
                .limit(4);

            if (motosError) {
                console.error('Error al cargar motos destacadas:', motosError);
            } else {
                setFeaturedMotos(motosData as Motorcycle[]);
            }

            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categorias')
                .select('*')
                .order('nombre');
            
            if (categoriesError) {
                console.error('Error al cargar categorías:', categoriesError);
            } else {
                setCategories(categoriesData as Category[]);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-white text-center"
                style={{ backgroundImage: `url('https://picsum.photos/seed/motobg/1920/1080')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="relative z-10 p-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight shadow-text">Catálogo de Motocicletas</h1>
                    <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto">Modelos Disponibles en Cuba. Esto es un catálogo de referencia, la compra se coordina por contacto directo.</p>
                    <Link to="/catalogo" className="bg-brand-blue text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-600 transition-transform transform hover:scale-105 duration-300 shadow-lg">
                        Ver Catálogo
                    </Link>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Explora por Categoría</h2>
                    <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Encuentra la moto perfecta para ti navegando a través de nuestras categorías.</p>
                    {loading ? <Spinner /> : (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {categories.map(category => (
                                <Link key={category.id} to={`/catalogo?categoria=${encodeURIComponent(category.nombre)}`}
                                    className="group relative rounded-lg overflow-hidden text-center transform hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                                    <img src={category.imageurl} alt={category.nombre} className="w-full h-32 object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center p-2">
                                        <h3 className="text-white font-bold text-lg">{category.nombre}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Models Section */}
            <section className="py-16 bg-brand-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Modelos Destacados</h2>
                    {loading ? (
                        <div className="flex justify-center"><Spinner /></div>
                    ) : featuredMotos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredMotos.map(moto => <MotorcycleCard key={moto.id} moto={moto} />)}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No hay modelos destacados en este momento.</p>
                    )}
                </div>
            </section>

            {/* How to Buy Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Cómo Comprar?</h2>
                    <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
                        Debido a las condiciones en Cuba, no procesamos pagos en línea. Este sitio funciona como un catálogo digital.
                        Si estás interesado en una motocicleta, contáctanos directamente para coordinar los detalles de la compra y el pago.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/catalogo" className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-blue transition-colors duration-300">
                           ¡Ver Motos Ahora!
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default HomePage;