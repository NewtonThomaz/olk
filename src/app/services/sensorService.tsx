import api from '../lib/api';
import { SensorDTO, SensorRequestDTO } from '../model/types/sensor';

export const sensorService = {
    // Como temos controllers separados para Temp e Umidade, o service decide qual chamar
    update: async (payload: SensorRequestDTO): Promise<SensorDTO> => {
        const endpoint = payload.tipo === 'TEMPERATURA' ? '/sensores-temperatura/' : '/sensores-umidade/';
        // Assumindo que no seu backend criar ou atualizar é um POST ou PUT
        // Vou usar POST para criar um novo sensor vinculado
        const { data } = await api.post<SensorDTO>(endpoint, payload);
        return data;
    }
};