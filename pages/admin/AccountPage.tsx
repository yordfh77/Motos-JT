
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const AccountPage: React.FC = () => {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });
        setLoading(false);

        if (error) {
            setMessage({ type: 'error', text: 'Error al actualizar la contraseña: ' + error.message });
        } else {
            setMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
            setPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mi Cuenta</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Información de la Cuenta</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Correo Electrónico</label>
                            <p className="text-lg text-gray-800">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Cambiar Contraseña</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                            <input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full form-input"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full form-input"
                                required
                            />
                        </div>

                        {message && (
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}

                        <div className="text-right">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-brand-blue text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                            >
                                {loading ? 'Guardando...' : 'Guardar Contraseña'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
