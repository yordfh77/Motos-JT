


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
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col ${!moto.disponible ? 'opacity-90' : ''}`}>
        <div className="relative h-64">
            <img src={moto.imagenes[0] || 'https://picsum.photos/400/300'} alt={moto.nombre} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors duration-300"></div>
            {moto.destacada && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-gray-800 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">Destacada</span>
            )}
            {!moto.disponible && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-0 backdrop-grayscale">
                    <span className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg transform -rotate-12 border-2 border-white">AGOTADO</span>
                </div>
            )}
        </div>
        <div className="p-5 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-1">
                <p className="text-sm text-gray-500">{moto.categoria}</p>
                {moto.rating !== undefined && moto.rating > 0 && (
                    <StarDisplay rating={moto.rating} />
                )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 truncate flex-grow">{moto.nombre}</h3>
            <p className="text-lg font-semibold text-brand-blue mt-2">{moto.precio.toLocaleString('es-CU')} {moto.moneda}</p>
            <Link to={`/moto/${moto.id}`} className="block w-full text-center bg-gray-800 text-white font-semibold py-2.5 rounded-lg mt-4 hover:bg-brand-blue transition-colors duration-300">
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
                    <h1 className="text-4xl font-extrabold text-gray-800">Nuestro Catálogo</h1>
                    <p className="text-lg text-gray-600 mt-2">Encuentra la motocicleta de tus sueños</p>
                </div>

                {/* Filters */}
                <div className="mb-10 p-6 bg-white rounded-2xl shadow-md space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Ej: Bera SBR, Rayan..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                id="category"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue transition"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">Todas las categorías</option>
                                {categories.map(cat => <option key={cat.nombre} value={cat.nombre}>{cat.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio Máx: ${priceRange[1]}</label>
                            <input
                                type="range"
                                id="price"
                                min="0"
                                max={maxPrice}
                                step="100"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                            />
                        </div>
                        <div>
                            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                            <select
                                id="availability"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue transition"
                                value={filterAvailable}
                                onChange={(e) => setFilterAvailable(e.target.value)}
                            >
                                <option value="all">Todas</option>
                                <option value="yes">Disponible</option>
                                <option value="no">Agotado</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="featured" className="block text-sm font-medium text-gray-700 mb-1">Destacadas</label>
                            <select
                                id="featured"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue transition"
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
                    <div className="text-center py-16 bg-red-50 text-red-700 p-4 rounded-lg">
                        <h3 className="text-2xl font-semibold">Ocurrió un error</h3>
                        <p className="mt-2">{error}</p>
                    </div>
                ) : filteredMotos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMotos.map(moto => <MotorcycleCard key={moto.id} moto={moto} />)}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold text-gray-700">No se encontraron motos</h3>
                        <p className="text-gray-500 mt-2">Intenta ajustar los filtros de búsqueda.</p>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
};

export default CatalogPage;