
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Category } from '../../types';
import { Spinner } from '../../components/Spinner';
import CategoryFormModal from './CategoryFormModal';

const CategoriesListPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error al cargar categorías:', error);
            setError(`No se pudieron cargar las categorías: ${error.message}`);
        } else {
            setCategories(data as Category[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenModal = (category: Category | null = null) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleSave = () => {
        fetchCategories();
        handleCloseModal();
    };

    const handleDelete = async (category: Category) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.nombre}"? Esta acción no se puede deshacer.`)) {
            
            // 1. Delete image from storage
            if (category.imageurl) {
                try {
                    const imagePath = new URL(category.imageurl).pathname.split('/categorias/').pop();
                    if(imagePath) {
                        const { error: storageError } = await supabase.storage.from('categorias').remove([imagePath]);
                        if (storageError) {
                             console.error("Error al eliminar imagen de la categoría:", storageError);
                        }
                    }
                } catch(e) {
                    console.error("URL de imagen inválida, no se pudo eliminar del storage:", category.imageurl);
                }
            }

            // 2. Delete category from database
            const { error } = await supabase.from('categorias').delete().eq('id', category.id);
            if (error) {
                alert('Error al eliminar la categoría.');
                console.error(error);
            } else {
                alert('Categoría eliminada con éxito.');
                fetchCategories();
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestionar Categorías</h1>
                <button onClick={() => handleOpenModal()} className="bg-brand-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    + Crear Categoría
                </button>
            </div>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Error al Cargar</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Imagen</th>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">
                                        No hay categorías para mostrar. ¡Crea la primera!
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <img src={cat.imageurl} alt={cat.nombre} className="h-12 w-12 object-cover rounded-md shadow-sm" />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{cat.nombre}</td>
                                        <td className="px-6 py-4 flex items-center space-x-3">
                                            <button onClick={() => handleOpenModal(cat)} className="font-medium text-brand-blue hover:underline">Editar</button>
                                            <button onClick={() => handleDelete(cat)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <CategoryFormModal
                    category={selectedCategory}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default CategoriesListPage;