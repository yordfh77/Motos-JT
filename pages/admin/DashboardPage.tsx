import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { Spinner } from '../../components/Spinner';
import { Motorcycle } from '../../types';

interface Stats {
    totalMotos: number;
    activeMotos: number;
    featuredMotos: number;
    categories: number;
}

const StatCard: React.FC<{ title: string; value: number | string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-lg">
        <div className="bg-brand-blue/10 text-brand-blue rounded-full p-3">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentMotos, setRecentMotos] = useState<Motorcycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const motosPromise = supabase.from('motos').select('*');
                const categoriesPromise = supabase.from('categorias').select('id', { count: 'exact' });

                const [motosResult, categoriesResult] = await Promise.all([motosPromise, categoriesPromise]);

                if (motosResult.error) throw motosResult.error;
                if (categoriesResult.error) throw categoriesResult.error;

                const motos = motosResult.data;
                const activeMotos = motos.filter(m => m.disponible).length;
                const featuredMotos = motos.filter(m => m.destacada).length;
                
                setStats({
                    totalMotos: motos.length,
                    activeMotos,
                    featuredMotos,
                    categories: categoriesResult.count ?? 0,
                });

                setRecentMotos(
                    (motos as Motorcycle[])
                        .sort((a, b) => new Date(b.fechacreacion).getTime() - new Date(a.fechacreacion).getTime())
                        .slice(0, 5)
                );

            } catch (error: any) {
                console.error("Error al cargar datos del dashboard:", error);
                setError(`No se pudieron cargar los datos del resumen: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    if (error) {
        return (
             <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Resumen del Catálogo</h1>
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Error al Cargar el Resumen</p>
                    <p>{error}</p>
                    <div className="mt-4">
                        <p className="font-semibold">Posibles Soluciones:</p>
                        <ul className="list-disc list-inside text-sm">
                            <li>Asegúrate de haber creado las tablas <strong>"motos"</strong> y <strong>"categorias"</strong> en tu base de datos de Supabase.</li>
                            <li>Si tienes activada la Seguridad a Nivel de Fila (RLS), verifica que exista una política que permita la <strong>lectura (SELECT)</strong> para usuarios autenticados.</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Resumen del Catálogo</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link to="/admin/motos">
                    <StatCard title="Total de Motos" value={stats?.totalMotos ?? 0} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m0-8v-2m0 16V4m6 8h2m-16 0h2m14 0h-2m-8 0h-2m14 0h-2m-2-8l-2-2m0 12l2-2m-12 0l-2 2m0-12l2 2m12 0l-2 2" /></svg>} />
                </Link>
                <Link to="/admin/motos">
                    <StatCard title="Motos Activas" value={stats?.activeMotos ?? 0} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </Link>
                <Link to="/admin/motos">
                    <StatCard title="Motos Destacadas" value={stats?.featuredMotos ?? 0} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
                </Link>
                <Link to="/admin/categorias">
                    <StatCard title="Categorías" value={stats?.categories ?? 0} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2" /></svg>} />
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Últimas Motos Agregadas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Categoría</th>
                                <th scope="col" className="px-6 py-3">Precio</th>
                                <th scope="col" className="px-6 py-3">Fecha de Creación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentMotos.map(moto => (
                                <tr key={moto.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{moto.nombre}</td>
                                    <td className="px-6 py-4">{moto.categoria}</td>
                                    <td className="px-6 py-4">{moto.precio.toLocaleString('es-CU')} {moto.moneda}</td>
                                    <td className="px-6 py-4">{new Date(moto.fechacreacion).toLocaleDateString('es-ES')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;