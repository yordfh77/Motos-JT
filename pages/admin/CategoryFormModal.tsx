
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Category } from '../../types';
import { Spinner } from '../../components/Spinner';

interface CategoryFormModalProps {
    category: Category | null;
    onClose: () => void;
    onSave: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = Boolean(category);

    useEffect(() => {
        if (category) {
            setName(category.nombre);
            setImagePreview(category.imageurl);
        }
    }, [category]);
    
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setError("El nombre de la categoría es obligatorio.");
            return;
        }
        if (!imageFile && !isEditing) {
            setError("Debe seleccionar una imagen para la nueva categoría.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let finalImageUrl = isEditing ? category?.imageurl : '';

            if (imageFile) {
                const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '-')}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('categorias')
                    .upload(fileName, imageFile);
                
                if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

                const { data: urlData } = supabase.storage.from('categorias').getPublicUrl(uploadData.path);
                finalImageUrl = urlData.publicUrl;

                // If editing and an old image exists, remove it from storage
                if (isEditing && category?.imageurl) {
                    const oldImagePath = new URL(category.imageurl).pathname.split('/categorias/').pop();
                    if(oldImagePath) {
                        await supabase.storage.from('categorias').remove([oldImagePath]);
                    }
                }
            }
            
            const categoryData = {
                id: isEditing ? category?.id : undefined,
                nombre: name,
                imageurl: finalImageUrl,
            };

            const { error } = await supabase.from('categorias').upsert(categoryData);
            if (error) throw error;
            
            onSave();

        } catch (error: any) {
            setError(error.message || 'Ocurrió un error inesperado.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 scale-95 animate-in fade-in zoom-in-95">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                        <div className="mt-2 flex items-center space-x-4">
                             {imagePreview && (
                                <img src={imagePreview} alt="Vista previa" className="h-20 w-20 object-cover rounded-lg shadow-sm" />
                            )}
                            <input
                                id="imageFile"
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="bg-brand-blue text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 min-w-[120px] flex justify-center items-center">
                            {loading ? <Spinner /> : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
