export interface OperacaoDTO {
    id: string;
    operacao: string;
    agente: string;
    dataHora: string;
}

export interface OperacaoRequestDTO {
    idTalhao: string;
    operacao: string;
    agente: string;
    dataHora: string;
}