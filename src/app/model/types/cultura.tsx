export interface CulturaDTO {
    id: string;
    nome: string;
    data: string;
}

export interface CulturaRequestDTO {
    nome: string;
    usuario: {
        id: string;
    };
    talhoes: {
        id: string;
    }[];
}