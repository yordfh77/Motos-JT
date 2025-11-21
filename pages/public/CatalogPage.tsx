
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group border border-gray-100 hover:shadow-2xl flex flex-col ${!moto.disponible ? 'opacity-90 grayscale-[0.5]' : ''}`}>
        <div className="relative h-64 overflow-hidden">
            <img src={moto.imagenes[0] || 'https://picsum.photos/400/300'} alt={moto.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
            
            {/* Badge Availability */}
            <div className={`absolute top-3 left-0 transform -skew-x-12 shadow-lg ${moto.disponible ? 'bg-[#00bfa5]' : 'bg-red-600'} px-4 py-1 z-10`}>
                 <span className="block transform skew-x-12 text-white font-black italic text-xs uppercase tracking-wider">
                    {moto.disponible ? 'DISPONIBLE' : 'AGOTADO'}
                </span>
            </div>
            
            {moto.destacada && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-black italic px-3 py-1 rounded-full shadow-md uppercase z-10">Destacada</span>
            )}

             {!moto.disponible && (
                <div className="absolute inset-0 flex items-center justify-center z-0 bg-white/30 backdrop-blur-[1px]">
                     <div className="bg-red-600 text-white text-sm font-black italic px-6 py-2 rounded-full shadow-2xl transform -rotate-12 border-4 border-white uppercase tracking-widest">
                        AGOTADO
                    </div>
                </div>
            )}
        </div>

        <div className="p-5 flex-grow flex flex-col relative">
            <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{moto.categoria}</p>
                {moto.rating !== undefined && moto.rating > 0 && (
                    <StarDisplay rating={moto.rating} />
                )}
            </div>

            <h3 className="text-2xl font-black italic text-gray-800 truncate uppercase tracking-tight mb-2 flex-grow">{moto.nombre}</h3>
            
             <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-lg font-bold text-red-600 italic">$</span>
                <span className="text-4xl font-black text-red-600 italic tracking-tighter leading-none">
                    {moto.precio.toLocaleString('es-CU')}
                </span>
                <span className="text-xs font-bold text-gray-500 ml-1">{moto.moneda}</span>
            </div>

            <Link to={`/moto/${moto.id}`} className="block w-full text-center bg-[#002d40] text-white font-black italic uppercase tracking-wide py-3 rounded-lg hover:bg-[#00bfa5] transition-colors duration-300 shadow-lg">
                Ver Detalles
            </Link>
        </div>
    </div>
);


const CatalogPage: React.FC = () => {
    const [motos, setMotos] = useState<Motorcycle[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [filterAvailable, setFilterAvailable] = useState('all');
    const [filterFeatured, setFilterFeatured] = useState('all');

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const categoryFromUrl = searchParams.get('categoria');
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const { data: motosData, error: motosError } = await supabase
                .from('motos')
                .select('*')
                .order('fechacreacion', { ascending: false });

            if (motosError) {
                console.error('Error al cargar las motos:', motosError);
                setError(`No se pudieron cargar las motos. Por favor, intente de nuevo más tarde. (${motosError.message})`);
            } else {
                setMotos(motosData as Motorcycle[]);
            }

            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categorias')
                .select('nombre')
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

    const filteredMotos = useMemo(() => {
        return motos.filter(moto => {
            const matchesSearch = moto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (moto.descripcion && moto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === 'all' || moto.categoria === selectedCategory;
            const matchesPrice = moto.precio >= priceRange[0] && moto.precio <= priceRange[1];
            
            let matchesAvailable = true;
            if (filterAvailable === 'yes') matchesAvailable = moto.disponible;
            if (filterAvailable === 'no') matchesAvailable = !moto.disponible;

            let matchesFeatured = true;
            if (filterFeatured === 'yes') matchesFeatured = moto.destacada;
            if (filterFeatured === 'no') matchesFeatured = !moto.destacada;

            return matchesSearch && matchesCategory && matchesPrice && matchesAvailable && matchesFeatured;
        });
    }, [motos, searchTerm, selectedCategory, priceRange, filterAvailable, filterFeatured]);

    const maxPrice = useMemo(() => Math.max(...motos.map(m => m.precio), 10000), [motos]);

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black italic uppercase text-[#002d40] tracking-tighter">Nuestro Catálogo</h1>
                    <p className="text-lg text-gray-600 mt-2 italic font-medium">Encuentra la motocicleta de tus sueños al mejor precio</p>
                    <div className="w-20 h-1.5 bg-[#00bfa5] mx-auto mt-4 transform -skew-x-12"></div>
                </div>

                {/* Filters */}
                <div className="mb-12 p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-black italic uppercase text-gray-800 mb-6 tracking-wide border-b pb-2">Filtros de Búsqueda</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                            <label htmlFor="search" className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Buscar por nombre</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Ej: Bera SBR, Rayan..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00bfa5] focus:border-transparent transition outline-none font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Categoría</label>
                            <select
                                id="category"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00bfa5] focus:border-transparent transition outline-none font-medium"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">Todas las categorías</option>
                                {categories.map(cat => <option key={cat.nombre} value={cat.nombre}>{cat.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider flex justify-between">
                                <span>Precio Máx</span>
                                <span className="text-[#00bfa5] font-black">${priceRange[1]}</span>
                            </label>
                            <input
                                type="range"
                                id="price"
                                min="0"
                                max={maxPrice}
                                step="100"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3 accent-[#00bfa5]"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                            />
                        </div>
                        <div>
                            <label htmlFor="availability" className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Disponibilidad</label>
                            <select
                                id="availability"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00bfa5] focus:border-transparent transition outline-none font-medium"
                                value={filterAvailable}
                                onChange={(e) => setFilterAvailable(e.target.value)}
                            >
                                <option value="all">Todas</option>
                                <option value="yes">Disponible</option>
                                <option value="no">Agotado</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="featured" className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Destacadas</label>
                            <select
                                id="featured"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00bfa5] focus:border-transparent transition outline-none font-medium"
                                value={filterFeatured}
                                onChange={(e) => setFilterFeatured(e.target.value)}
                            >
                                <option value="all">Todas</option>
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Motorcycle Grid */}
                {loading ? (
                    <div className="flex justify-center mt-16"><Spinner /></div>
                ) : error ? (
                    <div className="text-center py-16 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
                        <h3 className="text-2xl font-black italic">Ocurrió un error</h3>
                        <p className="mt-2">{error}</p>
                    </div>
                ) : filteredMotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMotos.map(moto => <MotorcycleCard key={moto.id} moto={moto} />)}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-3xl font-black italic text-gray-300 uppercase">No se encontraron motos</h3>
                        <p className="text-gray-500 mt-2">Intenta ajustar los filtros de búsqueda.</p>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
};

export default CatalogPage;
