'use client';

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Menu, X, User, Home, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { logout, user } = useAuth();

    const closeSidebar = () => setIsSidebarOpen(false);

    const navLinks = [
        { name: 'Início', icon: <Home className="w-5 h-5" />, href: '/home' },
        { name: 'Perfil', icon: <User className="w-5 h-5" />, href: '/perfil' },
        { name: 'Configurações', icon: <Settings className="w-5 h-5" />, href: '/configuracoes' },
    ];

    return (
        <section>
            <header className="bg-white w-full px-4 py-3 grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center shadow-sm border-b-2 border-[#6d9138] sticky top-0 z-50">

                <nav className="flex justify-start items-center">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden text-[#6d9138] p-1 focus:outline-none hover:bg-green-50 rounded-md transition-colors flex items-center"
                        aria-label="Abrir menu"
                    >
                        <Menu className="w-8 h-8" strokeWidth={2.5} />
                    </button>

                    <Link href="/home">
                        <figure className="hidden md:block w-40 h-auto m-0">
                            <Image
                                src="/logoComNome.png"
                                alt="NextGen Logo"
                                width={0}
                                height={0}
                                sizes='25dvw'
                                style={{ width: '100%', height: 'auto' }}
                                className="w-full h-full object-contain"
                            />
                        </figure>
                    </Link>
                </nav>

                <section className="flex justify-center items-center">
                    <Link href="/home">
                        <figure className="md:hidden w-32 h-auto m-0">
                            <Image
                                src="/logoComNome.png"
                                alt="NextGen Logo"
                                width={0}
                                height={0}
                                sizes='25dvw'
                                style={{ width: '100%', height: 'auto' }}
                                className="w-full h-full object-contain"
                            />
                        </figure>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-600 font-medium hover:text-[#6d9138] transition-colors text-base flex items-center gap-2"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </section>

                <section className="flex justify-end items-center gap-4">
                    <button
                        onClick={logout}
                        className="hidden md:flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>

                    <Link href="/perfil" className="text-[#6d9138] p-1 hover:bg-green-50 rounded-full transition-colors">
                        <figure className="rounded-full border-2 border-[#6d9138] flex items-center justify-center m-0 overflow-hidden w-[40px] h-[40px]">
                            <Image
                                src={user?.fotoPerfil || "/icon.png"}
                                alt={user?.nome || 'foto de perfil'}
                                className="w-full h-full object-cover"
                                height={0}
                                width={0}
                                sizes='25dvw'
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/icon.png";
                                }}
                            />
                        </figure>
                    </Link>
                </section>
            </header>

            {isSidebarOpen && (
                <section
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeSidebar}
                    role="dialog"
                    aria-modal="true"
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-[#739134] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <section className="p-5 flex flex-col h-full">
                    <header className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
                        <section className="flex items-center gap-3">
                            <section className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                                <Image
                                    src={user?.fotoPerfil || "/icon.png"}
                                    alt="Perfil"
                                    width={0}
                                    height={0}
                                    className="w-full h-full object-cover"
                                />
                            </section>
                            <span className="text-lg font-bold text-white truncate max-w-[120px]">
                                {user?.nome || 'Menu'}
                            </span>
                        </section>
                        <button onClick={closeSidebar} className="text-white hover:text-red-500" aria-label="Fechar menu">
                            <X className="w-6 h-6" />
                        </button>
                    </header>

                    <nav className="flex-1 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={closeSidebar}
                                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-green-50 hover:text-[#6d9138] rounded-lg transition-all font-medium"
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <footer className="border-t border-white/20 pt-4">
                        <button
                            onClick={() => {
                                closeSidebar();
                                logout();
                            }}
                            className="flex items-center gap-3 px-4 py-3 w-full text-white hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sair da Conta</span>
                        </button>
                    </footer>

                </section>
            </aside>
        </section>
    );
}