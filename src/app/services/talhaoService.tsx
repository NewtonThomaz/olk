import api from '../lib/api';
// Importe os DTOs corretos (ajuste o caminho se necessário)
import { TalhaoRequestDTO, TalhaoResponseDTO, TalhaoDetalhadoDTO } from '../model/types/talhao';

export const talhaoService = {
    getAll: async (): Promise<TalhaoResponseDTO[]> => {
        const { data } = await api.get<TalhaoResponseDTO[]>('/talhoes/');
        return data;
    },

    // Busca simples (usada na Home ou cards)
    getById: async (id: string): Promise<TalhaoResponseDTO> => {
        const { data } = await api.get<TalhaoResponseDTO>(`/talhoes/${id}`);
        return data;
    },

    // --- NOVO: Busca completa para a tela de detalhes ---
    getDetalhado: async (id: string): Promise<TalhaoDetalhadoDTO> => {
        const { data } = await api.get<TalhaoDetalhadoDTO>(`/talhoes/${id}/detalhes`);
        return data;
    },

    create: async (payload: TalhaoRequestDTO): Promise<TalhaoResponseDTO> => {
        const { data } = await api.post<TalhaoResponseDTO>('/talhoes/', payload);
        return data;
    },
    update: async (id: string, payload: Partial<TalhaoRequestDTO>): Promise<TalhaoResponseDTO> => {
        const { data } = await api.put<TalhaoResponseDTO>(`/talhoes/${id}`, payload);
        return data;
    },

    getActives: async (): Promise<TalhaoResponseDTO[]> => {
        const { data } = await api.get<TalhaoResponseDTO[]>('/talhoes/ativos');
        return data;
    },

    // --- NOVO: Função de deletar ---
    delete: async (id: string): Promise<void> => {
        await api.delete(`/talhoes/${id}`);
    }
};