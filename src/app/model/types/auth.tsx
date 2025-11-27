export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface LoginResponseDTO {
  token: string;
}

export interface RegisterRequestDTO {
  nome: string;
  email: string;
  senha: string;
  fotoPerfil?: string;
}

export interface UsuarioResponseDTO {
  id: string;
  nome: string;
  email: string;
  fotoPerfil: string;
}