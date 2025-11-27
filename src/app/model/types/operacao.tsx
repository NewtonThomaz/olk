export interface OperacaoDTO {
    id: string;
    operacao: string;
    agente: string;
    dataHora: string;
}

export interface OperacaoRequestDTO {
    operacao: string;
    agente: string;
    dataHora: string; // ISO DateTime
    idTalhao: string;
}