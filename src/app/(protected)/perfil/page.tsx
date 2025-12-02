"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Edit, LogOut, Trash2, Check, Loader2, Camera } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../hooks/useAuth';

export default function UserProfile() {
    const { logout, user, updateProfile, updatePhoto, loading } = useAuth();
    
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState("");
    
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

    // Handler atualizado para enviar o arquivo direto
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Validação de tamanho (ex: 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert("A imagem deve ter no máximo 5MB.");
                    return;
                }
                
                // Chama a nova função de upload direto
                await updatePhoto(file);
                
            } catch (error) {
                console.error("Erro ao atualizar foto", error);
                alert("Erro ao enviar a foto. Tente novamente.");
            }
        }
    };

    return (
        <main className="flex flex-col items-center min-h-full bg-white text-gray-800 font-sans w-full">

            <section className="flex flex-col items-center w-full max-w-xs md:max-w-md lg:max-w-lg py-10 mx-auto flex-grow justify-center">
                
                <figure className="w-[35dvw] md:w-48 md:h-48 mb-6 rounded-full overflow-hidden border-4 border-[#66823a] shadow-md aspect-square relative bg-gray-100">
                    {user?.fotoPerfil ? (
                        <Image
                            src={user.fotoPerfil}
                            alt="Foto de Perfil"
                            fill
                            className="object-cover"
                            // Adicionado unoptimized se a imagem vier de localhost sem tratamento do Next
                            unoptimized={user.fotoPerfil.startsWith('http')} 
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
                            defaultValue={user?.email || "Carregando..."}
                            className="flex-grow bg-transparent px-4 text-gray-700 text-base outline-none text-center w-full font-medium"
                            readOnly
                        />
                    </label>

                    <button
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
        </main>
    );
}