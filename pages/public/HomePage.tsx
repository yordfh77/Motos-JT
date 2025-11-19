
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { supabase } from '../../services/supabaseClient';
import { Motorcycle, Category, Testimonial } from '../../types';
import { Spinner } from '../../components/Spinner';

const MotorcycleCard: React.FC<{ moto: Motorcycle }> = ({ moto }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
        <div className="relative h-56">
            <img src={moto.imagenes[0] || 'https://picsum.photos/400/300'} alt={moto.nombre} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-colors duration-300"></div>
            {moto.destacada && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Destacada</span>
            )}
        </div>
        <div className="p-5">
            <p className="text-sm text-gray-500 mb-1">{moto.categoria}</p>
            <h3 className="text-xl font-bold text-gray-800 truncate">{moto.nombre}</h3>
            <p className="text-lg font-semibold text-brand-blue mt-2">{moto.precio.toLocaleString('es-CU')} {moto.moneda}</p>
            <Link to={`/moto/${moto.id}`} className="block w-full text-center bg-gray-800 text-white font-semibold py-2.5 rounded-lg mt-4 hover:bg-brand-blue transition-colors duration-300">
                Ver Detalles
            </Link>
        </div>
    </div>
);

const StarRating: React.FC<{ rating: number, setRating?: (r: number) => void, editable?: boolean }> = ({ rating, setRating, editable = false }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => editable && setRating && setRating(star)}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${editable ? 'cursor-pointer' : ''} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const HomePage: React.FC = () => {
    const [featuredMotos, setFeaturedMotos] = useState<Motorcycle[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    // Testimonial Form State
    const [newTestimonial, setNewTestimonial] = useState({ nombre: '', comentario: '', puntuacion: 5 });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            const { data: motosData, error: motosError } = await supabase
                .from('motos')
                .select('*')
                .eq('disponible', true)
                .eq('destacada', true)
                .limit(4);

            if (motosError) console.error('Error al cargar motos destacadas:', motosError);
            else setFeaturedMotos(motosData as Motorcycle[]);

            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categorias')
                .select('*')
                .order('nombre');
            
            if (categoriesError) console.error('Error al cargar categorías:', categoriesError);
            else setCategories(categoriesData as Category[]);

            // Fetch approved testimonials
            const { data: testimonialsData, error: testimonialsError } = await supabase
                .from('testimonios')
                .select('*')
                .eq('aprobado', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (testimonialsError) console.error('Error al cargar testimonios:', testimonialsError);
            else setTestimonials(testimonialsData as Testimonial[]);

            setLoading(false);
        };

        fetchData();
    }, []);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTestimonial.nombre.trim() || !newTestimonial.comentario.trim()) {
            setReviewMessage({ type: 'error', text: 'Por favor completa todos los campos.' });
            return;
        }

        setSubmittingReview(true);
        setReviewMessage(null);

        try {
            const { error } = await supabase.from('testimonios').insert([{
                nombre: newTestimonial.nombre,
                comentario: newTestimonial.comentario,
                puntuacion: newTestimonial.puntuacion,
                aprobado: false // Needs admin approval
            }]);

            if (error) throw error;

            setReviewMessage({ type: 'success', text: '¡Gracias por tu comentario! Será publicado después de ser revisado.' });
            setNewTestimonial({ nombre: '', comentario: '', puntuacion: 5 });
        } catch (err) {
            console.error(err);
            setReviewMessage({ type: 'error', text: 'Hubo un error al enviar tu comentario. Inténtalo de nuevo.' });
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-white text-center"
                style={{ backgroundImage: `url('https://picsum.photos/seed/motobg/1920/1080')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="relative z-10 p-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight shadow-text">Catálogo de Motocicletas</h1>
                    <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto">Modelos Disponibles en Cuba. Esto es un catálogo de referencia, la compra se coordina por contacto directo.</p>
                    <Link to="/catalogo" className="bg-brand-blue text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-600 transition-transform transform hover:scale-105 duration-300 shadow-lg">
                        Ver Catálogo
                    </Link>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Explora por Categoría</h2>
                    <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Encuentra la moto perfecta para ti navegando a través de nuestras categorías.</p>
                    {loading ? <Spinner /> : (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {categories.map(category => (
                                <Link key={category.id} to={`/catalogo?categoria=${encodeURIComponent(category.nombre)}`}
                                    className="group relative rounded-lg overflow-hidden text-center transform hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                                    <img src={category.imageurl} alt={category.nombre} className="w-full h-32 object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center p-2">
                                        <h3 className="text-white font-bold text-lg">{category.nombre}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Models Section */}
            <section className="py-16 bg-brand-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Modelos Destacados</h2>
                    {loading ? (
                        <div className="flex justify-center"><Spinner /></div>
                    ) : featuredMotos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredMotos.map(moto => <MotorcycleCard key={moto.id} moto={moto} />)}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No hay modelos destacados en este momento.</p>
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Lo que dicen nuestros clientes</h2>
                    <p className="text-center text-gray-600 mb-10">Tu opinión es lo más importante para nosotros.</p>
                    
                    {/* Review Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {testimonials.map(t => (
                            <div key={t.id} className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{t.nombre}</h4>
                                        <StarRating rating={t.puntuacion} />
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600 italic">"{t.comentario}"</p>
                            </div>
                        ))}
                        {testimonials.length === 0 && !loading && (
                            <div className="col-span-full text-center text-gray-500 py-4">
                                Sé el primero en dejar un comentario.
                            </div>
                        )}
                    </div>

                    {/* Add Review Form */}
                    <div className="max-w-2xl mx-auto bg-blue-50 rounded-2xl p-8 shadow-inner">
                        <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Déjanos tu Comentario</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="reviewName" className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
                                    <input 
                                        type="text" 
                                        id="reviewName" 
                                        value={newTestimonial.nombre}
                                        onChange={e => setNewTestimonial({...newTestimonial, nombre: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                        required
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Puntuación</label>
                                    <div className="flex items-center py-2 bg-white px-4 border border-gray-300 rounded-lg">
                                        <StarRating 
                                            rating={newTestimonial.puntuacion} 
                                            setRating={(r) => setNewTestimonial({...newTestimonial, puntuacion: r})} 
                                            editable={true} 
                                        />
                                        <span className="ml-2 text-sm text-gray-500">({newTestimonial.puntuacion}/5)</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-1">Tu Experiencia</label>
                                <textarea 
                                    id="reviewComment" 
                                    rows={3} 
                                    value={newTestimonial.comentario}
                                    onChange={e => setNewTestimonial({...newTestimonial, comentario: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                                    required
                                    placeholder="Cuéntanos qué te pareció nuestro servicio..."
                                ></textarea>
                            </div>
                            {reviewMessage && (
                                <div className={`p-3 rounded-lg text-center text-sm ${reviewMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {reviewMessage.text}
                                </div>
                            )}
                            <div className="text-center">
                                <button 
                                    type="submit" 
                                    disabled={submittingReview}
                                    className="bg-brand-blue text-white font-bold py-2 px-8 rounded-full hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                                >
                                    {submittingReview ? 'Enviando...' : 'Enviar Comentario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* How to Buy Section */}
            <section className="py-16 bg-white border-t">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Cómo Comprar?</h2>
                    <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
                        Debido a las condiciones en Cuba, no procesamos pagos en línea. Este sitio funciona como un catálogo digital.
                        Si estás interesado en una motocicleta, contáctanos directamente para coordinar los detalles de la compra y el pago.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/catalogo" className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-blue transition-colors duration-300">
                           ¡Ver Motos Ahora!
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default HomePage;