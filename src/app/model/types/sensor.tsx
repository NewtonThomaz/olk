export interface SensorDTO {
    id: string;
    ip: string;
    tipo: 'TEMPERATURA' | 'UMIDADE';
}

export interface SensorRequestDTO {
    ip: string;
    tipo: 'TEMPERATURA' | 'UMIDADE';
    idTalhao: string;
}