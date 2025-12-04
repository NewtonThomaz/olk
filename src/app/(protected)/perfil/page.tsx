"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Edit, LogOut, Trash2, Check, Loader2, Camera, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function UserProfile() {
    const { logout, user, updateProfile, updatePhoto, loading } = useAuth();
    
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState("");
    
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const GREEN_DARK = "#7fa048";
    const GREEN_MEDIUM = "#8da85e";
    const GRAY_LIGHT = "#f4f4f4";
    const GRAY_BORDER = "#cccccc";

    useEffect(() => {
        if (user) {
            setUserName(user.nome);
        }
    }, [user]);

    const handleEditToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            try {
                if (userName !== user?.nome) {
                    await updateProfile({ nome: userName });
                }
                setIsEditing(false);
            } catch (error) {
                console.error("Falha ao salvar nome", error);
            }
        } else {
            setIsEditing(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const maxFileSize = 20 * 1024 * 1024; // 20 MB
                if (file.size > maxFileSize) {
                    alert("A imagem deve ter no máximo 20MB.");
                    return;
                }
                await updatePhoto(file);
            } catch (error) {
                console.error("Erro ao atualizar foto", error);
                alert("Erro ao enviar a foto. Tente novamente.");
            }
        }
    };
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (newPassword.length < 6) {
            setPasswordError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("As senhas não coincidem.");
            return;
        }

        try {
            await updateProfile({ senha: newPassword });
            
            // Limpa e fecha o modal
            setNewPassword("");
            setConfirmPassword("");
            setIsPasswordModalOpen(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            alert("Senha atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar senha", error);
            setPasswordError("Erro ao atualizar a senha. Tente novamente.");
        }
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    return (
        <main className="flex flex-col items-center min-h-full bg-white text-gray-800 font-sans w-full relative">

            <section className="flex flex-col items-center w-full max-w-xs md:max-w-md lg:max-w-lg py-10 mx-auto flex-grow justify-center">
                
                <figure className="w-[35dvw] md:w-48 md:h-48 mb-6 rounded-full overflow-hidden border-4 border-[#66823a] shadow-md aspect-square relative bg-gray-100">
                    {user?.fotoPerfil ? (
                        <img
                            src={user.fotoPerfil}
                            alt="Foto de Perfil"
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <span className="text-4xl font-bold">{user?.nome?.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                </figure>

                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                />

                <button
                    onClick={handlePhotoClick}
                    disabled={loading}
                    style={{ backgroundColor: GREEN_DARK }}
                    className="hover:bg-[#66823a] text-white font-bold text-[15px] py-2 px-10 rounded-xl shadow-md mb-8 transition-colors tracking-wide flex items-center gap-2 disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                    Mudar Foto
                </button>

                <form className="w-full flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                    <label
                        style={!isEditing ? { backgroundColor: GRAY_LIGHT, borderColor: GRAY_BORDER } : {}}
                        className={`flex items-center rounded-lg overflow-hidden h-12 transition-all shadow-sm border ${isEditing ? 'ring-1 ring-[#7fa048] bg-white border-[#7fa048]' : ''}`}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            readOnly={!isEditing || loading}
                            placeholder="Seu nome"
                            className={`flex-grow bg-transparent px-4 text-gray-700 text-base outline-none placeholder-gray-500 h-full ${!isEditing ? 'font-medium' : ''}`}
                        />
                        <button
                            onClick={handleEditToggle}
                            disabled={loading}
                            style={{ backgroundColor: GREEN_DARK }}
                            className="w-12 h-full flex items-center justify-center cursor-pointer hover:bg-[#66823a] transition-colors rounded-r-lg disabled:opacity-70"
                            title={isEditing ? "Salvar nome" : "Editar nome"}
                        >
                            {loading ? (
                                <Loader2 className="text-white animate-spin" size={20} />
                            ) : isEditing ? (
                                <Check className="text-white" size={20} strokeWidth={3} />
                            ) : (
                                <Edit className="text-white" size={20} strokeWidth={2.5} />
                            )}
                        </button>
                    </label>

                    <label
                        style={{ backgroundColor: GRAY_LIGHT, borderColor: GRAY_BORDER }}
                        className="flex items-center rounded-lg overflow-hidden h-12 shadow-sm border"
                    >
                        <input
                            type="email"
                            value={user?.email || "Carregando..."} 
                            className="flex-grow bg-transparent px-4 text-gray-700 text-base outline-none text-center w-full font-medium"
                            readOnly
                        />
                    </label>

                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        style={{ backgroundColor: GREEN_DARK }}
                        className="hover:bg-[#66823a] text-white font-bold text-lg py-3 rounded-xl shadow-lg mt-4 w-full transition-colors tracking-wide active:shadow-md"
                    >
                        Redefinir Senha
                    </button>
                </form>

            </section>
            
            <footer className="flex justify-center gap-5 w-full mt-auto pb-10">
                <button
                    onClick={logout}
                    style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                    className="flex items-center gap-2 border-[1.5px] bg-white px-7 py-1 rounded-full hover:bg-green-50 transition-colors text-base font-medium shadow-sm"
                >
                    Sair
                    <LogOut size={18} strokeWidth={2.5} />
                </button>

                <button
                    className="flex items-center gap-2 border-[1.5px] border-red-500 text-red-500 bg-white px-5 py-1 rounded-full hover:bg-red-50 transition-colors text-base font-medium shadow-sm"
                >
                    Excluir
                    <Trash2 size={18} strokeWidth={2.5} />
                </button>
            </footer>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#7fa048] p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Lock size={20} />
                                Nova Senha
                            </h3>
                            <button 
                                onClick={closePasswordModal}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handlePasswordSubmit} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                                <div className="relative">
                                    <input 
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7fa048] focus:border-transparent outline-none transition-all"
                                        placeholder="Digite sua nova senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#7fa048] transition-colors focus:outline-none"
                                        title={showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7fa048] focus:border-transparent outline-none transition-all"
                                        placeholder="Confirme a nova senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#7fa048] transition-colors focus:outline-none"
                                        title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {passwordError && (
                                <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-1 rounded">
                                    {passwordError}
                                </p>
                            )}

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={closePasswordModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ backgroundColor: GREEN_DARK }}
                                    className="flex-1 px-4 py-2 text-white rounded-lg hover:bg-[#66823a] transition-colors font-bold disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}