// Certifique-se de que o Enum Permissao está importado corretamente ou defina-o aqui se preferir
import { Permissao } from './enum'; 
// Se não tiver o arquivo enum, podemos definir inline para simplificar:
// export type Permissao = 'ROOT' | 'ADMIN' | 'VIEW';

export interface ColaboradorDTO {
    id: string;
    usuario: { // O backend geralmente retorna o objeto usuário completo ou o ID
        id: string;
        nome: string;
        email: string;
        fotoPerfil?: string;
    } | string; 
    talhao: string | { id: string };
    permissao: Permissao;
}

// CORREÇÃO: O DTO de Request agora bate com o que o Java espera (chaves 'usuario' e 'talhao')
export interface ColaboradorRequestDTO {
    usuario: string; // ID do usuário (UUID)
    talhao: string;  // ID do talhão (UUID)
    permissao: Permissao;
}