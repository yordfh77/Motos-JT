import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '../../services/supabaseClient';
import { Motorcycle, Category } from '../../types';
import { Spinner } from '../../components/Spinner';

const MotorcycleCard: React.FC<{ moto: Motorcycle }> = ({ moto }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col">
        <div className="relative h-64">
            <img src={moto.imagenes[0] || 'https://picsum.photos/400/300'} alt={moto.nombre} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors duration-300"></div>
            {moto.destacada && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Destacada</span>
            )}
        </div>
        <div className="p-5 flex-grow flex flex-col">
            <p className="text-sm text-gray-500 mb-1">{moto.categoria}</p>
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
                .eq('disponible', true)
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
            return matchesSearch && matchesCategory && matchesPrice;
        });
    }, [motos, searchTerm, selectedCategory, priceRange]);

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
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
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Rango de Precio: ${priceRange[0]} - ${priceRange[1]}</label>
                            <input
                                type="range"
                                id="price"
                                min="0"
                                max={maxPrice}
                                step="100"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                            />
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