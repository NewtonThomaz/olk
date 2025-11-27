import api from '../lib/api';
import { ColaboradorDTO, ColaboradorRequestDTO } from '../model/types/colaborador';

export const colaboradorService = {
    create: async (payload: ColaboradorRequestDTO): Promise<ColaboradorDTO> => {
        const { data } = await api.post<ColaboradorDTO>('/colaboradores/', payload);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/colaboradores/${id}`);
    }
};