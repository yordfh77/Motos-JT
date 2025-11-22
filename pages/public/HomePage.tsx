
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
        </div>
    );
};

const MotorcycleCard: React.FC<{ moto: Motorcycle }> = ({ moto }) => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group border border-gray-100 hover:shadow-2xl hover:border-[#d946ef]/30">
        <div className="relative h-56 overflow-hidden">
            <img src={moto.imagenes[0] || 'https://picsum.photos/400/300'} alt={moto.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
            
            {/* Badge Availability */}
            <div className={`absolute top-3 left-0 transform -skew-x-12 shadow-lg ${moto.disponible ? 'bg-[#00bfa5]' : 'bg-red-600'} px-4 py-1`}>
                 <span className="block transform skew-x-12 text-white font-black italic text-xs uppercase tracking-wider">
                    {moto.disponible ? 'DISPONIBLE' : 'AGOTADO'}
                </span>
            </div>

            {moto.destacada && (
                <span className="absolute top-3 right-3 bg-[#d946ef] text-white text-xs font-black italic px-3 py-1 rounded-full shadow-md uppercase border border-white/20">Destacada</span>
            )}
        </div>
        
        <div className="p-5 relative">
            <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{moto.categoria}</p>
                {moto.rating !== undefined && moto.rating > 0 && (
                    <StarDisplay rating={moto.rating} />
                )}
            </div>
            
            <h3 className="text-2xl font-black italic text-gray-800 truncate uppercase tracking-tight mb-2 group-hover:text-[#d946ef] transition-colors">{moto.nombre}</h3>
            
            <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-lg font-bold text-red-600 italic">$</span>
                <span className="text-4xl font-black text-red-600 italic tracking-tighter leading-none">
                    {moto.precio.toLocaleString('es-CU')}
                </span>
                <span className="text-xs font-bold text-gray-500 ml-1">{moto.moneda}</span>
            </div>
            
            <Link to={`/moto/${moto.id}`} className="block w-full text-center bg-[#002d40] text-white font-black italic uppercase tracking-wide py-3 rounded-lg hover:bg-[#00bfa5] transition-all duration-300 shadow-lg group-hover:shadow-[#00bfa5]/30">
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
            <section className="relative h-[75vh] flex items-center justify-center text-white text-center overflow-hidden bg-black">
                 {/* Background Image */}
                <div className="absolute inset-0 bg-black">
                    <img src="https://picsum.photos/seed/motorcycle_neon/1920/1080" alt="Hero BG" className="w-full h-full object-cover opacity-50 mix-blend-screen" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#002d40]/80 via-transparent to-[#002d40]"></div>
                
                <div className="relative z-10 p-4 flex flex-col items-center">
                    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tight mb-4 leading-none drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d946ef] to-purple-400 pr-2">Ayocet</span> 
                        <span className="text-white mx-2">/</span> 
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00bfa5] to-cyan-300 pr-2">JT</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-bold italic tracking-wide text-gray-200 drop-shadow-md border-l-4 border-[#d946ef] pl-4">
                        El futuro de la movilidad en tus manos.
                    </p>
                    <Link to="/catalogo" className="bg-[#d946ef] hover:bg-[#c026d3] text-white font-black italic uppercase tracking-wider py-4 px-10 rounded-full text-lg transition-all duration-300 shadow-[0_0_20px_rgba(217,70,239,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.8)] hover:-translate-y-1 border-2 border-white/20">
                        Ver Catálogo
                    </Link>
                </div>
            </section>

             {/* Wave Separator Top */}
             <div className="relative -mt-16 z-20">
                 <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Categories Section */}
            <section className="py-16 bg-white relative z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase text-[#002d40] mb-4 tracking-tighter">
                        Explora por <span className="text-[#00bfa5]">Categoría</span>
                    </h2>
                    <div className="w-24 h-2 bg-gradient-to-r from-[#d946ef] to-[#00bfa5] mx-auto mb-12 transform -skew-x-12"></div>

                    {loading ? <Spinner /> : (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {categories.map(category => (
                                <Link key={category.id} to={`/catalogo?categoria=${encodeURIComponent(category.nombre)}`}
                                    className="group relative rounded-xl overflow-hidden text-center transform hover:-translate-y-2 transition-all duration-300 shadow-lg border-2 border-transparent hover:border-[#d946ef]">
                                    <img src={category.imageurl} alt={category.nombre} className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#002d40]/90 via-[#002d40]/50 to-transparent flex items-end justify-center p-4">
                                        <h3 className="text-white font-black italic uppercase text-lg tracking-wide group-hover:text-[#d946ef] transition-colors drop-shadow-md">{category.nombre}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            
            {/* Wave Separator Middle */}
            <div className="relative -mb-1 z-20">
                 <svg className="w-full h-16 md:h-32" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#002d40" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Featured Models Section (Dark Green/Blue) */}
            <section className="py-20 bg-[#002d40] relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                         <h2 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter mb-2" style={{WebkitTextStroke: '1px transparent'}}>
                            Modelos <span className="text-[#d946ef]">Destacados</span>
                        </h2>
                        <p className="text-gray-300 text-lg italic">Las mejores opciones seleccionadas para ti</p>
                    </div>
                   
                    {loading ? (
                        <div className="flex justify-center"><Spinner /></div>
                    ) : featuredMotos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredMotos.map(moto => <MotorcycleCard key={moto.id} moto={moto} />)}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 italic">No hay modelos destacados en este momento.</p>
                    )}
                    
                    <div className="text-center mt-16">
                        <Link to="/catalogo" className="inline-block border-2 border-[#00bfa5] text-[#00bfa5] font-black italic uppercase tracking-wider py-3 px-10 rounded-full text-lg hover:bg-[#00bfa5] hover:text-[#00332a] hover:shadow-[0_0_20px_rgba(0,191,165,0.5)] transition-all duration-300">
                            Ver Todo el Catálogo
                        </Link>
                    </div>
                </div>
            </section>

             {/* Wave Separator Bottom */}
             <div className="relative -mt-1 z-20 transform rotate-180">
                 <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#002d40" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* How to Buy Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-4xl mx-auto bg-gray-50 rounded-3xl p-8 md:p-12 shadow-xl border-2 border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d946ef] opacity-10 rounded-bl-full"></div>
                        
                        <h2 className="text-3xl md:text-4xl font-black italic uppercase text-[#002d40] mb-6">¿Cómo Comprar?</h2>
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                            Debido a las condiciones en Cuba, no procesamos pagos en línea. Este sitio funciona como un catálogo digital.
                            Si estás interesado en una motocicleta, contáctanos directamente para coordinar los detalles.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/catalogo" className="bg-[#002d40] text-white font-black italic py-4 px-10 rounded-full text-lg hover:bg-[#d946ef] hover:shadow-lg transition-all duration-300 uppercase tracking-wide">
                               ¡Ver Motos Ahora!
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default HomePage;
