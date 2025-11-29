import { Permissao } from './enum'; 

export interface ColaboradorDTO {
    id: string;
    usuario: {
        id: string;
        nome: string;
        email: string;
        fotoPerfil?: string;
    } | string; 
    talhao: string | { id: string };
    permissao: Permissao;
}

export interface ColaboradorRequestDTO {
    usuario: string;
    talhao: string;
    permissao: Permissao;
}