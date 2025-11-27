import api from '../lib/api';
import { OperacaoDTO, OperacaoRequestDTO } from '../model/types/operacao';

export const operacaoService = {
    create: async (payload: OperacaoRequestDTO): Promise<OperacaoDTO> => {
        const { data } = await api.post<OperacaoDTO>('/operacoes/', payload);
        return data;
    },
    
    delete: async (id: string): Promise<void> => {
        await api.delete(`/operacoes/${id}`);
    }
};