

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { Motorcycle, Specifications, Category } from '../../types';
import { Spinner } from '../../components/Spinner';

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const MotorcycleFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    
    const [moto, setMoto] = useState<Partial<Motorcycle>>({
        nombre: '',
        categoria: '',
        precio: 0,
        moneda: 'USD',
        descripcion: '',
        especificaciones: { cilindrada: '', motor: '', bateria: '', frenos: '', velocidad: '' },
        imagenes: [],
        disponible: true,
        destacada: false,
    });
    const [categories, setCategories] = useState<Category[]>([]);
    
    // State for new images being uploaded
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    
    // State for images already in DB
    const [existingImages, setExistingImages] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);
    const [allSpecs, setAllSpecs] = useState<Record<keyof Specifications, string[]>>({});

    const fetchFormData = useCallback(async () => {
        setLoading(true);

        const catPromise = supabase.from('categorias').select('*').order('nombre');
        const specPromise = supabase.from('motos').select('especificaciones');
        
        const [catResult, specResult] = await Promise.all([catPromise, specPromise]);
        
        if (catResult.error) {
             console.error('Error al cargar categorías:', catResult.error);
        } else {
            setCategories(catResult.data as Category[]);
        }
        
        if (specResult.data) {
            const uniqueSpecs: Record<keyof Specifications, Set<string>> = {};
            specResult.data.forEach(item => {
                if (item.especificaciones) {
                    for (const key in item.especificaciones) {
                        const specKey = key as keyof Specifications;
                        if (!uniqueSpecs[specKey]) uniqueSpecs[specKey] = new Set();
                        if (item.especificaciones[specKey]) {
                            uniqueSpecs[specKey].add(item.especificaciones[specKey]);
                        }
                    }
                }
            });
            const specsForDatalist: Record<keyof Specifications, string[]> = {};
            for (const key in uniqueSpecs) {
                specsForDatalist[key as keyof Specifications] = Array.from(uniqueSpecs[key as keyof Specifications]);
            }
            setAllSpecs(specsForDatalist);
        }
        
        if (isEditing && id) {
            const { data, error } = await supabase.from('motos').select('*').eq('id', id).single();
            if (error) {
                console.error('Error al cargar la moto:', error);
                navigate('/admin/motos');
            } else {
                setMoto(data);
                setExistingImages(data.imagenes || []);
            }
        }
        setLoading(false);
    }, [id, isEditing, navigate]);

    useEffect(() => {
        fetchFormData();
    }, [fetchFormData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMoto(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMoto(prev => ({
            ...prev,
            especificaciones: { ...(prev.especificaciones as Specifications), [name]: value },
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setMoto(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // FIX: Cast result of Array.from to File[] to avoid type error 'unknown not assignable to Blob'
            const newFiles = Array.from(e.target.files) as File[];
            
            // Calculate total images if these are added
            const totalImages = existingImages.length + imageFiles.length + newFiles.length;

            // Validar que no exceda 5 imágenes
            if (totalImages > 5) {
                alert(`Solo se permiten hasta 5 imágenes por moto. Actualmente tienes ${existingImages.length + imageFiles.length} y quieres agregar ${newFiles.length}.`);
                e.target.value = ''; // Reset input
                return;
            }

            // Accumulate files instead of replacing
            setImageFiles(prev => [...prev, ...newFiles]);
            
            // Generate previews for new files
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);

            // Reset input value to allow selecting the same file again if needed (after deletion)
            e.target.value = '';
        }
    };
    
    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []); // Clean up on unmount

    const handleRemoveExistingImage = async (imageUrl: string) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta imagen guardada?")) return;
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
    };

    const handleRemoveNewImage = (index: number) => {
        // Remove from files array
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        
        // Remove from previews array and revoke URL
        setImagePreviews(prev => {
            const urlToRemove = prev[index];
            URL.revokeObjectURL(urlToRemove);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moto.nombre || !moto.categoria) {
            setFormError("El nombre y la categoría son obligatorios.");
            return;
        }
        setLoading(true);
        setFormError(null);

        try {
            // 1. Determine which existing images were removed (compared to original DB state) and delete from storage
            const originalImages = isEditing ? (await supabase.from('motos').select('imagenes').eq('id', id).single()).data?.imagenes || [] : [];
            const imagesToDelete = originalImages.filter((img: string) => !existingImages.includes(img));
            
            if (imagesToDelete.length > 0) {
                const pathsToDelete = imagesToDelete.map((url: string) => {
                    try {
                        return new URL(url).pathname.split('/motos/').pop();
                    } catch (e) { return null; }
                }).filter(Boolean);
                
                if (pathsToDelete.length > 0) {
                     await supabase.storage.from('motos').remove(pathsToDelete as string[]);
                }
            }

            // 2. Upload new images
            const uploadedImageUrls: string[] = [...existingImages];
            
            for (const file of imageFiles) {
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('motos')
                    .upload(fileName, file);

                if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);
                
                const { data: urlData } = supabase.storage.from('motos').getPublicUrl(uploadData.path);
                uploadedImageUrls.push(urlData.publicUrl);
            }

            // 3. Prepare data for upsert
            const motoData: any = {
                ...moto,
                precio: Number(moto.precio),
                imagenes: uploadedImageUrls,
                fechaactualizacion: new Date().toISOString(),
            };
            
            if (!isEditing) {
                delete motoData.id; // Ensure no ID is passed on create
            } else {
                 motoData.id = id;
            }

            // 4. Upsert motorcycle data
            const { error } = await supabase.from('motos').upsert(motoData).select();

            if (error) throw error;

            alert(`Moto ${isEditing ? 'actualizada' : 'creada'} con éxito.`);
            navigate('/admin/motos');

        } catch (error: any) {
            setFormError(error.message || 'Ocurrió un error inesperado.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    const specFields: { name: keyof Specifications; placeholder: string }[] = [
        { name: 'cilindrada', placeholder: 'Cilindrada (ej: 125cc)' },
        { name: 'motor', placeholder: 'Tipo de Motor (ej: 4 Tiempos)' },
        { name: 'bateria', placeholder: 'Batería (ej: 72V 20Ah)' },
        { name: 'frenos', placeholder: 'Frenos (ej: Disco/Tambor)' },
        { name: 'velocidad', placeholder: 'Velocidad Máxima (ej: 90 km/h)' },
    ];

    if (loading && !isEditing) return <div className="flex justify-center items-center h-full"><Spinner /></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {isEditing ? `Editando: ${moto.nombre || 'Moto'}` : 'Crear Nueva Moto'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                
                <FormSection title="Información Principal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input type="text" name="nombre" value={moto.nombre} onChange={handleInputChange} className="w-full form-input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select name="categoria" value={moto.categoria} onChange={handleInputChange} className="w-full form-select" required>
                                <option value="" disabled>-- Selecciona una categoría --</option>
                                {categories.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <input type="number" name="precio" value={moto.precio} onChange={handleInputChange} min="0" className="w-full form-input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                            <select name="moneda" value={moto.moneda} onChange={handleInputChange} className="w-full form-select">
                                <option value="USD">USD</option>
                                <option value="MLC">MLC</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada</label>
                        <textarea name="descripcion" value={moto.descripcion} onChange={handleInputChange} rows={5} className="w-full form-textarea"></textarea>
                    </div>
                </FormSection>

                <FormSection title="Especificaciones Técnicas">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {specFields.map(field => (
                             <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.placeholder}</label>
                                <input
                                    type="text"
                                    name={field.name as string}
                                    list={`datalist-${field.name}`}
                                    placeholder={field.placeholder}
                                    value={moto.especificaciones?.[field.name] || ''}
                                    onChange={handleSpecChange}
                                    className="w-full form-input" />
                                <datalist id={`datalist-${field.name}`}>
                                    {allSpecs[field.name]?.map(opt => <option key={opt} value={opt} />)}
                                </datalist>
                            </div>
                        ))}
                    </div>
                </FormSection>

                <FormSection title="Multimedia">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imágenes ({existingImages.length + imageFiles.length}/5)
                        </label>
                        
                        <input 
                            type="file" 
                            multiple 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            disabled={existingImages.length + imageFiles.length >= 5}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                        />
                        
                        <p className="text-xs text-gray-500 mt-2">
                            Puedes subir hasta 5 imágenes. La primera será la principal (Portada).
                        </p>
                        
                        {(existingImages.length > 0 || imagePreviews.length > 0) && (
                             <div className="mt-6">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Galería de Imágenes</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {/* Render Existing Images (Already in Server) */}
                                    {existingImages.map((imgUrl, index) => (
                                        <div key={`existing-${imgUrl}`} className="relative group aspect-square">
                                            <img src={imgUrl} alt={`Existente ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200" />
                                            <div className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full">Guardada</div>
                                            <button type="button" onClick={() => handleRemoveExistingImage(imgUrl)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center shadow-md transform hover:scale-110 transition-transform">
                                                &#x2715;
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Render New Images (Previews) */}
                                     {imagePreviews.map((previewUrl, index) => (
                                        <div key={`new-${index}`} className="relative group aspect-square">
                                            <img src={previewUrl} alt={`Nueva ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-sm border-2 border-brand-blue" />
                                            <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full">Nueva</div>
                                            <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center shadow-md transform hover:scale-110 transition-transform">
                                                &#x2715;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </FormSection>

                 <FormSection title="Publicación">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center">
                            <input type="checkbox" id="disponible" name="disponible" checked={moto.disponible} onChange={handleCheckboxChange} className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded" />
                            <label htmlFor="disponible" className="ml-2 block text-sm text-gray-900">Marcar como Disponible</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="destacada" name="destacada" checked={moto.destacada} onChange={handleCheckboxChange} className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded" />
                            <label htmlFor="destacada" className="ml-2 block text-sm text-gray-900">Marcar como Destacada</label>
                        </div>
                    </div>
                </FormSection>
                
                {formError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">{formError}</p>}

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={() => navigate('/admin/motos')} className="bg-gray-200 text-gray-800 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="bg-brand-blue text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center justify-center min-w-[150px]">
                        {loading ? <Spinner /> : (isEditing ? 'Guardar Cambios' : 'Crear Moto')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MotorcycleFormPage;