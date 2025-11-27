import api from '../lib/api';
import { LoginRequestDTO, LoginResponseDTO, RegisterRequestDTO, UsuarioResponseDTO } from '../model/types/auth';

export const authService = {
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const { data } = await api.post<LoginResponseDTO>('/usuarios/auth', credentials);
    return data;
  },

  register: async (userData: RegisterRequestDTO): Promise<UsuarioResponseDTO> => {
    const { data } = await api.post<UsuarioResponseDTO>('/usuarios/register', userData);
    return data;
  },

  getUserById: async (id: string): Promise<UsuarioResponseDTO> => {
    const { data } = await api.get<UsuarioResponseDTO>(`/usuarios/${id}`);
    return data;
  },

  getAll: async (): Promise<UsuarioResponseDTO[]> => {
    try {
      // Ajuste a rota '/usuarios' se o seu backend usar outro caminho (ex: '/usuarios/')
      const { data } = await api.get<UsuarioResponseDTO[]>('/usuarios/');
      return data;
    } catch (error: any) {
      // Se for erro de permissão (403), retorna lista vazia para não quebrar a tela
      if (error.response && error.response.status === 403) {
        console.warn("Usuário sem permissão para listar todos os usuários (403).");
        return [];
      }
      throw error;
    }
  }
};