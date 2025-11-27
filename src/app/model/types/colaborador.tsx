import { Permissao } from './enum'

export interface ColaboradorDTO {
    id: string;
    email: string; 
    permissao: Permissao;
}

export interface ColaboradorRequestDTO {
    email: string;
    permissao: Permissao;
    idTalhao: string;
}