import api from '../lib/api';
import { CulturaDTO, CulturaRequestDTO } from '../model/types/cultura';

export const culturaService = {
    // Busca todas (se precisar filtrar no front)
    getAll: async (): Promise<CulturaDTO[]> => {
        const { data } = await api.get<CulturaDTO[]>('/culturas/');
        return data;
    },

    create: async (payload: CulturaRequestDTO): Promise<CulturaDTO> => {
        const { data } = await api.post<CulturaDTO>('/culturas/', payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/culturas/${id}`);
    }
};