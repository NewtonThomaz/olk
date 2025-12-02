import api from '../lib/api';
import { CulturaDTO, CulturaRequestDTO } from '../model/types/cultura';

export const culturaService = {
    getAll: async (): Promise<CulturaDTO[]> => {
        const { data } = await api.get<CulturaDTO[]>('/culturas/');
        return data;
    },

    create: async (payload: CulturaRequestDTO): Promise<CulturaDTO> => {
        const { data } = await api.post<CulturaDTO>('/culturas/', payload);
        return data;
    },

    // ADICIONE ISTO AQUI
    update: async (id: string, payload: CulturaRequestDTO): Promise<CulturaDTO> => {
        const { data } = await api.put<CulturaDTO>(`/culturas/${id}`, payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/culturas/${id}`);
    }
};