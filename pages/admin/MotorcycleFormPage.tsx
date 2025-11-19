
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
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
            const newFiles = Array.from(e.target.files);
            
            // Calculate total images: Existing ones + Currently staged ones + New ones trying to add
            const currentTotal = existingImages.length + imageFiles.length;
            
            // Validar que no exceda 5 imágenes en total
            if (currentTotal + newFiles.length > 5) {
                const remainingSlots = 5 - currentTotal;
                alert(`Solo se permiten hasta 5 imágenes por moto. Tienes ${currentTotal} seleccionadas. Solo puedes agregar ${remainingSlots} más.`);
                e.target.value = ''; // Reset input
                return;
            }

            // Append new files to existing state instead of replacing
            setImageFiles(prev => [...prev, ...newFiles]);
            
            // Generate previews for new files
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);

            // Reset input to allow selecting the same file again if needed (or adding more batches)
            e.target.value = '';
        }
    };
    
    const handleRemoveNewImage = (index: number) => {
        // Revoke the URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[index]);

        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        // Cleanup function when component unmounts to revoke all object URLs
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []); // Only on unmount

    const handleRemoveExistingImage = async (imageUrl: string) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta imagen? Esta acción se aplicará al guardar.")) return;
        
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moto.nombre || !moto.categoria) {
            setFormError("El nombre y la categoría son obligatorios.");
            return;
        }

        // Validation for positive price
        if (!moto.precio || Number(moto.precio) <= 0) {
             setFormError("El precio debe ser un número mayor a 0.");
             return;
        }

        setLoading(true);
        setFormError(null);

        try {
            // 1. Determine which existing images were removed and delete them from storage
            const originalImages = isEditing ? (await supabase.from('motos').select('imagenes').eq('id', id).single()).data?.imagenes || [] : [];
            const imagesToDelete = originalImages.filter((img: string) => !existingImages.includes(img));
            
            if (imagesToDelete.length > 0) {
                const pathsToDelete = imagesToDelete.map((url: string) => new URL(url).pathname.split('/motos/').pop()).filter(Boolean);
                if (pathsToDelete.length > 0) {
                     await supabase.storage.from('motos').remove(pathsToDelete as string[]);
                }
            }

            // 2. Upload new images
            const uploadedImageUrls: string[] = [...existingImages];
            for (const file of imageFiles) {
                const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
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
                        
                        {/* Price and Currency Combined Input */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="precio"
                                    id="price"
                                    className="block w-full rounded-md border-gray-300 pl-7 pr-20 focus:border-brand-blue focus:ring-brand-blue py-2 border shadow-sm sm:text-sm"
                                    placeholder="0.00"
                                    value={moto.precio}
                                    onChange={handleInputChange}
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <label htmlFor="currency" className="sr-only">Moneda</label>
                                    <select
                                        id="currency"
                                        name="moneda"
                                        className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm font-bold"
                                        value={moto.moneda}
                                        onChange={handleInputChange}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="MLC">MLC</option>
                                        <option value="CUP">CUP</option>
                                    </select>
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">El valor debe ser positivo.</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes (Máx. 5)</label>
                        <input 
                            type="file" 
                            multiple 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100" 
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Seleccionadas: {existingImages.length + imageFiles.length} / 5. 
                            Puedes subir hasta 5 imágenes en total.
                        </p>
                        
                        {(existingImages.length > 0 || imagePreviews.length > 0) && (
                             <div className="mt-6">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Previsualización de Imágenes</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {/* Existing Images (Server) */}
                                    {existingImages.map((imgUrl) => (
                                        <div key={imgUrl} className="relative group aspect-square">
                                            <img src={imgUrl} alt="Imagen existente" className="w-full h-full object-cover rounded-lg shadow-sm" />
                                            <button type="button" onClick={() => handleRemoveExistingImage(imgUrl)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-red-700">
                                                &#x2715;
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* New Images (Local Preview) */}
                                     {imagePreviews.map((previewUrl, index) => (
                                        <div key={previewUrl} className="relative group aspect-square">
                                            <img src={previewUrl} alt={`Previsualización ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-sm border-2 border-brand-blue" />
                                            <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-red-700">
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
