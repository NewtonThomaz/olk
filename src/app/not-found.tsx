'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CornerUpLeft } from 'lucide-react';


export default function App() {
    return (
        <main className="min-h-screen w-full bg-white flex items-center justify-center p-6 font-sans">

            <section className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-4xl w-full transition-all duration-300">

                <figure className="w-[65dvw] md:w-[22dvw] h-auto relative flex justify-center transition-all duration-100">
                    <Image
                        src="/logo.png"
                        alt="Logo NextGen Agricultural Technology"
                        width={0}
                        height={0}
                        sizes="(max-width: 768px) 128px, 192px"
                        style={{ width: '100%', height: 'auto' }}
                        className="object-contain"
                        priority
                    />
                </figure>

                <section className="flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-6">

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        404 Não Encontrado
                    </h1>

                    <Link href='/home'
                        className="flex justify-center items-center gap-2 px-8 py-3 rounded-full text-white w-[70dvw] md:w-[18dvw] font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group"
                        style={{
                            background: 'linear-gradient(90deg, #7d9d42 0%, #9cc53b 100%)'
                        }}
                        aria-label="Voltar para a página inicial"
                    >
                        <CornerUpLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                        <span>Retornar ao Inicio</span>
                    </Link>

                </section>

            </section>
        </main>
    );
}