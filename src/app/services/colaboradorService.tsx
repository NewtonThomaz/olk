import api from '../lib/api';
import { ColaboradorDTO, ColaboradorRequestDTO } from '../model/types/colaborador';

export const colaboradorService = {
    create: async (payload: ColaboradorRequestDTO): Promise<ColaboradorDTO> => {
        const { data } = await api.post<ColaboradorDTO>('/colaboradores/', payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/colaboradores/${id}`);
    },
    
    update: async (id: string, payload: any): Promise<any> => {
        const { data } = await api.put(`/colaboradores/${id}`, payload);
        return data;
    },

    findAll: async (): Promise<ColaboradorDTO[]> => {
        const { data } = await api.get<ColaboradorDTO[]>('/colaboradores/');
        return data;
    }
};