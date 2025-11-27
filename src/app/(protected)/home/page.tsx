'use client';

import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Plus, ArrowLeft, Loader2, ChevronDown } from 'lucide-react';

// Ajuste os caminhos conforme sua estrutura de pastas
import { carrossel } from "../../model/data/carrossel";
import { useAuth } from '../../hooks/useAuth';
import { useTalhoes } from '../../hooks/useTalhoes';
import { Medida } from '../../model/types/enum';

export default function Home() {
    const { user } = useAuth();
    const { talhoes, loading: loadingTalhoes, createTalhao } = useTalhoes();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        tamanho: '',
        medida: Medida.HECTARE
    });

    const meusTalhoes = useMemo(() => {
        return talhoes.filter(talhao => {
            if (!user) return false;
            return talhao.nomeResponsavel === user.nome;
        });
    }, [talhoes, user]);

    const areaTotalEmHectares = useMemo(() => {
        return meusTalhoes.reduce((acc, talhao) => {
            let valorEmHectares = Number(talhao.tamanho);

            switch (talhao.medida) {
                case Medida.METROS_QUADRADOS:
                    valorEmHectares = Number(talhao.tamanho) / 10000;
                    break;
                case Medida.QUILOMETROS_QUADRADOS:
                    valorEmHectares = Number(talhao.tamanho) * 100;
                    break;
                case Medida.HECTARE:
                default:
                    valorEmHectares = Number(talhao.tamanho);
                    break;
            }

            return acc + valorEmHectares;
        }, 0);
    }, [meusTalhoes]);

    const totalCulturasUnicas = useMemo(() => {
        const culturasSet = new Set<string>();

        meusTalhoes.forEach(talhao => {
            if (talhao.nomesCulturas && talhao.nomesCulturas.length > 0) {
                talhao.nomesCulturas.forEach(cultura => {
                    culturasSet.add(cultura);
                });
            }
        });

        return culturasSet.size;
    }, [meusTalhoes]);

    const openModal = () => setIsModalOpen(true);

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ nome: '', descricao: '', tamanho: '', medida: Medida.HECTARE });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) {
            alert("Erro: Usuário não identificado. Faça login novamente.");
            return;
        }

        setIsSaving(true);

        const success = await createTalhao({
            nome: formData.nome,
            descricao: formData.descricao,
            tamanho: Number(formData.tamanho),
            medida: formData.medida,
            idUsuario: user.id,
            idsCulturas: [],
            idsOperacoes: [],
            idsColaboradores: []
        });

        setIsSaving(false);

        if (success) {
            closeModal();
        } else {
            alert('Erro ao criar talhão. Verifique os dados.');
        }
    };

    return (
        // AJUSTE 1: Removido 'min-h-screen'. Usamos w-full e h-full para respeitar o layout pai.
        // Adicionado 'overflow-y-auto' caso este container precise scrollar internamente.
        <main className="w-full h-full bg-white pb-12 overflow-x-hidden">

            <header className="p-6 pb-2">
                <h1 className="text-2xl text-black">
                    Olá, <span className="font-bold text-[#6e8e38]">{user?.nome || 'Produtor'}</span>
                </h1>
            </header>

            <section className="w-full mx-auto pt-6 px-4">
                <Swiper
                    className="w-full"
                    modules={[Autoplay]}
                    spaceBetween={30}
                    slidesPerView={3}
                    autoplay={{ delay: 3000 }}
                    loop={true}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {carrossel.map((item, index) => (
                        <SwiperSlide key={index} className="rounded-2xl shadow-lg overflow-hidden h-56">
                            {/* Dica: Considere usar o componente <Image /> do Next.js futuramente */}
                            <img className="w-full h-full object-cover" src={item.src} alt={item.alt} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            <section className={`transition-all duration-300 ${isModalOpen ? 'blur-sm brightness-50 pointer-events-none' : ''}`}>

                {/* AJUSTE 2: Mudado de w-[100dvw] para w-full. 100dvw ignora scrollbars verticais e causa rolagem horizontal. */}
                <section className="flex justify-center items-center gap-4 px-6 mt-4 mb-8 text-center w-full">

                    <article className="flex-1 border-r border-gray-200 last:border-0">
                        <h3 className="text-sm text-gray-600 mb-1">Talhões</h3>
                        <p className="text-3xl font-normal text-black">{meusTalhoes.length}</p>
                        <span className="text-xs text-[#6e8e38]">ativos</span>
                    </article>

                    <article className="flex-1 border-r border-gray-200 pr-5 last:border-0">
                        <h3 className="text-sm text-gray-600 mb-1">Área Total</h3>
                        <p className="text-3xl font-normal text-black">
                            {areaTotalEmHectares.toFixed(2)}
                        </p>
                        <span className="text-xs text-[#6e8e38]">hectares</span>
                    </article>

                    <article className="flex-1">
                        <h3 className="text-sm text-gray-600 mb-1">Culturas</h3>
                        <p className="text-3xl font-normal text-black">{totalCulturasUnicas}</p>
                        <span className="text-xs text-[#6e8e38]">variedades</span>
                    </article>

                </section>

                <section className="px-6 flex flex-col gap-4">
                    <div className="flex justify-between items-end mb-2">
                        <h2 className="text-lg font-bold text-gray-700">Seus Talhões</h2>
                        <button onClick={openModal} className="flex items-center gap-2 text-[#6e8e38] font-medium hover:opacity-80 transition-opacity">
                            <span className="bg-[#8cab50] text-white rounded-full p-1"><Plus size={16} /></span>
                            Novo
                        </button>
                    </div>

                    {loadingTalhoes ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-[#6e8e38] w-8 h-8" />
                        </div>
                    ) : meusTalhoes.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                            {talhoes.length > 0 ? "Você ainda não tem talhões." : "Nenhum talhão no sistema."}
                        </div>
                    ) : (
                        meusTalhoes.map((talhao) => (
                            <article key={talhao.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <header>
                                    <h4 className="text-black font-medium text-lg">
                                        {talhao.nome}
                                    </h4>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">
                                            {talhao.tamanho} {
                                                talhao.medida === Medida.HECTARE ? 'ha' :
                                                    talhao.medida === Medida.METROS_QUADRADOS ? 'm²' : 'km²'
                                            }
                                        </span>
                                        <span className="text-xs text-[#6e8e38] mt-1">
                                            {talhao.nomesCulturas && talhao.nomesCulturas.length > 0
                                                ? talhao.nomesCulturas.join(', ')
                                                : 'Solo em descanso'}
                                        </span>
                                    </div>
                                </header>
                                <Link href={`/talhoes/${talhao.id}`}>
                                    <button className="border border-[#8cab50] text-[#6e8e38] px-4 py-1 rounded-full text-sm hover:bg-[#f4f9eb] transition-colors">
                                        Detalhes
                                    </button>
                                </Link>
                            </article>
                        ))
                    )}
                </section>

            </section>

            {isModalOpen && (
                <dialog className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/50 p-4 md:p-0 backdrop-blur-sm">
                    <form
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border-2 border-gray-100 animate-in fade-in zoom-in duration-200"
                        onSubmit={handleSubmit}
                    >
                        <header className="flex items-center gap-4 mb-6 relative">
                            <button type="button" onClick={closeModal} className="text-[#6e8e38] hover:bg-gray-100 p-1 rounded-full transition-colors absolute left-0">
                                <ArrowLeft size={28} />
                            </button>
                            <h2 className="text-2xl font-bold text-[#4a5e2a] w-full text-center">Novo Talhão</h2>
                        </header>

                        <fieldset className="space-y-5">
                            <label className="block">
                                <span className="text-[#4a5e2a] font-bold text-lg block mb-1">Nome</span>
                                <input
                                    type="text"
                                    placeholder="Ex: Talhão Norte"
                                    required
                                    className="w-full border border-[#6e8e38] rounded-xl p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6e8e38]/50"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[#4a5e2a] font-bold text-lg block mb-1">Descrição</span>
                                <textarea
                                    rows={3}
                                    placeholder="Detalhes sobre o solo, localização..."
                                    className="w-full border border-[#6e8e38] rounded-xl p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6e8e38]/50 resize-none text-sm"
                                    value={formData.descricao}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                />
                            </label>

                            <label className="block">
                                <span className="text-[#4a5e2a] font-bold text-lg block mb-1">Tamanho e Medida</span>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        required
                                        step="0.01"
                                        className="w-2/3 border border-[#6e8e38] rounded-xl p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6e8e38]/50"
                                        value={formData.tamanho}
                                        onChange={e => setFormData({ ...formData, tamanho: e.target.value })}
                                    />

                                    <div className="w-1/3 relative">
                                        <select
                                            className="w-full h-full bg-[#8cab50] text-white rounded-xl px-2 text-sm appearance-none text-center font-medium focus:outline-none cursor-pointer"
                                            value={formData.medida}
                                            onChange={e => setFormData({ ...formData, medida: e.target.value as Medida })}
                                        >
                                            <option value={Medida.HECTARE}>Hectare</option>
                                            <option value={Medida.METROS_QUADRADOS}>m²</option>
                                            <option value={Medida.QUILOMETROS_QUADRADOS}>km²</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-white">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-[#8cab50] text-white font-bold text-lg py-3 rounded-full mt-4 shadow-md hover:bg-[#7a9644] transition-transform transform active:scale-95 disabled:opacity-70 flex justify-center items-center"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : 'Salvar Talhão'}
                            </button>

                        </fieldset>
                    </form>
                </dialog>
            )}

        </main>
    );
}