
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Testimonial } from '../../types';
import { Spinner } from '../../components/Spinner';

const TestimonialsListPage: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editComment, setEditComment] = useState('');
    const [editName, setEditName] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending'>('all');

    const fetchTestimonials = async () => {
        setLoading(true);
        let query = supabase
            .from('testimonios')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (filter === 'pending') {
            query = query.eq('aprobado', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error al cargar testimonios:', error);
        } else {
            setTestimonials(data as Testimonial[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTestimonials();
    }, [filter]);

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('testimonios')
            .update({ aprobado: !currentStatus })
            .eq('id', id);
        
        if (error) {
            alert('Error al actualizar estado');
        } else {
            fetchTestimonials();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Eliminar este comentario permanentemente?')) {
            const { error } = await supabase
                .from('testimonios')
                .delete()
                .eq('id', id);
            
            if (error) alert('Error al eliminar');
            else fetchTestimonials();
        }
    };

    const startEdit = (t: Testimonial) => {
        setEditingId(t.id);
        setEditName(t.nombre);
        setEditComment(t.comentario);
    };

    const saveEdit = async (id: string) => {
        if (!editName.trim() || !editComment.trim()) {
            alert("El nombre y el comentario no pueden estar vacíos.");
            return;
        }

        const { error } = await supabase
            .from('testimonios')
            .update({ 
                nombre: editName,
                comentario: editComment 
            })
            .eq('id', id);

        if (error) {
            console.error(error);
            alert('Error al guardar cambios');
        } else {
            setEditingId(null);
            fetchTestimonials();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestionar Testimonios</h1>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setFilter('all')} 
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setFilter('pending')} 
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'pending' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Pendientes
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Puntuación</th>
                                <th className="px-6 py-3">Comentario</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        {filter === 'pending' ? 'No hay comentarios pendientes.' : 'No hay comentarios aún.'}
                                    </td>
                                </tr>
                            ) : (
                                testimonials.map((t) => (
                                    <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                                        
                                        {/* Editable Name Field */}
                                        <td className="px-6 py-4 font-medium text-gray-900 min-w-[150px]">
                                            {editingId === t.id ? (
                                                <input 
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full p-1 border rounded text-sm"
                                                />
                                            ) : (
                                                t.nombre
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex text-yellow-400 text-xs">
                                                {[...Array(t.puntuacion)].map((_, i) => <span key={i}>★</span>)}
                                            </div>
                                        </td>

                                        {/* Editable Comment Field */}
                                        <td className="px-6 py-4 min-w-[300px]">
                                            {editingId === t.id ? (
                                                <div className="flex flex-col space-y-2">
                                                    <textarea 
                                                        value={editComment} 
                                                        onChange={(e) => setEditComment(e.target.value)}
                                                        className="w-full p-2 border rounded-md text-gray-800 text-sm"
                                                        rows={3}
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => saveEdit(t.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Guardar</button>
                                                        <button onClick={() => setEditingId(null)} className="text-xs bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500">Cancelar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                t.comentario
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.aprobado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {t.aprobado ? 'Público' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleToggleApproval(t.id, t.aprobado)} 
                                                className={`text-xs px-3 py-1 rounded text-white transition-colors ${t.aprobado ? 'bg-orange-400 hover:bg-orange-500' : 'bg-green-500 hover:bg-green-600'}`}
                                            >
                                                {t.aprobado ? 'Ocultar' : 'Aprobar'}
                                            </button>
                                            {!editingId && (
                                                <button onClick={() => startEdit(t)} className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                                                    Editar
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(t.id)} className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
                                                Eliminar
                                            </button>
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

export default TestimonialsListPage;
