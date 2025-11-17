import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { Motorcycle } from '../../types';
import { Spinner } from '../../components/Spinner';

const MotorcyclesListPage: React.FC = () => {
    const [motos, setMotos] = useState<Motorcycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMotos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('motos')
            .select('*')
            .order('fechacreacion', { ascending: false });

        if (error) {
            console.error('Error al cargar motos:', error);
            setError(`No se pudieron cargar las motos: ${error.message}`);
        } else {
            setMotos(data as Motorcycle[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMotos();
    }, []);

    const handleDelete = async (motoId: string, imagenes: string[]) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta moto? Esta acción no se puede deshacer.')) {
            // Delete images from storage by extracting path from URL
            const imagePaths = imagenes.map(url => {
                try {
                    const path = new URL(url).pathname.split('/motos/').pop();
                    return path;
                } catch(e) {
                    console.error("URL de imagen inválida, no se puede extraer la ruta:", url);
                    return null;
                }
            }).filter(Boolean) as string[];

            if (imagePaths.length > 0) {
                 const { error: storageError } = await supabase.storage.from('motos').remove(imagePaths);
                 if (storageError) {
                    console.error("Error al eliminar imágenes:", storageError);
                    alert("Error al eliminar las imágenes de la moto. La moto no fue eliminada.");
                    return;
                }
            }

            // Delete motorcycle from database
            const { error: dbError } = await supabase.from('motos').delete().eq('id', motoId);

            if (dbError) {
                alert('Error al eliminar la moto.');
            } else {
                alert('Moto eliminada con éxito.');
                fetchMotos();
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    
    if (error) return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error al Cargar las Motos</p>
            <p>{error}</p>
            <div className="mt-4">
                <p className="font-semibold">Posibles Soluciones:</p>
                <ul className="list-disc list-inside text-sm">
                    <li>Asegúrate de haber creado la tabla <strong>"motos"</strong> en tu base de datos de Supabase.</li>
                    <li>Si tienes activada la Seguridad a Nivel de Fila (RLS) en la tabla "motos", verifica que exista una política que permita la operación de <strong>lectura (SELECT)</strong> para los usuarios autenticados.</li>
                </ul>
            </div>
        </div>
    );


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestionar Motos</h1>
                <Link to="/admin/motos/nueva" className="bg-brand-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    + Crear Moto
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Categoría</th>
                                <th className="px-6 py-3">Precio</th>
                                <th className="px-6 py-3">Disponible</th>
                                <th className="px-6 py-3">Destacada</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {motos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No hay motos para mostrar. ¡Crea la primera!
                                    </td>
                                </tr>
                            ) : (
                                motos.map((moto) => (
                                    <tr key={moto.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{moto.nombre}</td>
                                        <td className="px-6 py-4">{moto.categoria}</td>
                                        <td className="px-6 py-4">{moto.precio.toLocaleString('es-CU')} {moto.moneda}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${moto.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {moto.disponible ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${moto.destacada ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {moto.destacada ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center space-x-3">
                                            <Link to={`/admin/motos/editar/${moto.id}`} className="font-medium text-brand-blue hover:underline">Editar</Link>
                                            <button onClick={() => handleDelete(moto.id, moto.imagenes)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MotorcyclesListPage;