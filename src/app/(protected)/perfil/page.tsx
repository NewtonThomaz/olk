"use client";
import React, { useState, useRef } from 'react';
import { Edit, LogOut, Trash2, Check } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../hooks/useAuth';

export default function UserProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState("Nome do Usuario");
    const inputRef = useRef(null);
    const { logout, user } = useAuth();

    // Cores do tema:
    const GREEN_DARK = "#7fa048";
    const GREEN_MEDIUM = "#8da85e";
    const GRAY_LIGHT = "#f4f4f4";
    const GRAY_BORDER = "#cccccc";

    const handleEditToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsEditing(!isEditing);
    };

    return (
        // AJUSTE: 'min-h-full' em vez de 'min-h-screen'. 
        // Isso permite que o layout pai controle o scroll e evita a barra de rolagem dupla.
        <main className="flex flex-col items-center min-h-full bg-white text-gray-800 font-sans w-full">

            <section className="flex flex-col items-center w-full max-w-xs md:max-w-md lg:max-w-lg py-10 mx-auto flex-grow justify-center">
                <figure className="w-[35dvw] md:w-48 md:h-48 mb-6 rounded-full overflow-hidden border-4 border-[#66823a] shadow-md aspect-square relative">
                    {/* Ajustado para garantir proporção quadrada e responsividade melhor que dvw puro */}
                    <Image
                        src="/icon.png"
                        alt="Foto de Perfil"
                        fill
                        className="object-cover"
                    />
                </figure>
                
                {/* Botão Mudar Foto */}
                <button
                    style={{ backgroundColor: GREEN_DARK }}
                    className="hover:bg-[#66823a] text-white font-bold text-[15px] py-2 px-10 rounded-xl shadow-md mb-8 transition-colors tracking-wide"
                >
                    Mudar Foto
                </button>

                {/* Formulário */}
                <form className="w-full flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>

                    {/* Input Nome */}
                    <label
                        style={!isEditing ? { backgroundColor: GRAY_LIGHT, borderColor: GRAY_BORDER } : {}}
                        className={`flex items-center rounded-lg overflow-hidden h-12 transition-all shadow-sm border ${isEditing ? 'ring-1 ring-[#7fa048] bg-white border-[#7fa048]' : ''}`}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            readOnly={!isEditing}
                            className={`flex-grow bg-transparent px-4 text-gray-700 text-base outline-none placeholder-gray-500 h-full ${!isEditing ? 'font-medium' : ''}`}
                        />
                        {/* Botão de Editar */}
                        <button
                            onClick={handleEditToggle}
                            style={{ backgroundColor: GREEN_DARK }}
                            className="w-12 h-full flex items-center justify-center cursor-pointer hover:bg-[#66823a] transition-colors rounded-r-lg"
                            title="Editar nome"
                        >
                            {isEditing
                                ? <Check className="text-white" size={20} strokeWidth={3} />
                                : <Edit className="text-white" size={20} strokeWidth={2.5} />
                            }
                        </button>
                    </label>

                    {/* Input Email */}
                    <label
                        style={{ backgroundColor: GRAY_LIGHT, borderColor: GRAY_BORDER }}
                        className="flex items-center rounded-lg overflow-hidden h-12 shadow-sm border"
                    >
                        <input
                            type="email"
                            defaultValue={user?.email || "usuario@email.com"}
                            className="flex-grow bg-transparent px-4 text-gray-700 text-base outline-none text-center w-full font-medium"
                            readOnly
                        />
                    </label>

                    {/* Botão Redefinir Senha */}
                    <button
                        style={{ backgroundColor: GREEN_DARK }}
                        className="hover:bg-[#66823a] text-white font-bold text-lg py-3 rounded-xl shadow-lg mt-4 w-full transition-colors tracking-wide active:shadow-md"
                    >
                        Redefinir Senha
                    </button>
                </form>

            </section>

            {/* --- RODAPÉ --- */}
            <footer className="flex justify-center gap-5 w-full mt-auto pb-10">

                {/* Botão Sair */}
                <button
                    onClick={logout}
                    style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                    className="flex items-center gap-2 border-[1.5px] bg-white px-7 py-1 rounded-full hover:bg-green-50 transition-colors text-base font-medium shadow-sm"
                >
                    Sair
                    <LogOut size={18} strokeWidth={2.5} />
                </button>

                {/* Botão Excluir */}
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