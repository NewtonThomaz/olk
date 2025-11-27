'use client';

import { useState } from 'react';
import { sensorService } from '../services/sensorService';

export function useSensorForm(talhaoId: string, tipo: 'TEMPERATURA' | 'UMIDADE', onSuccess: () => void) {
    const [loading, setLoading] = useState(false);
    const [ip, setIp] = useState('');

    const submit = async () => {
        setLoading(true);
        try {
            await sensorService.update({
                ip: ip,
                tipo: tipo,
                idTalhao: talhaoId
            });
            alert('Sensor configurado!');
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar sensor.');
        } finally {
            setLoading(false);
        }
    };

    return { ip, setIp, submit, loading };
}