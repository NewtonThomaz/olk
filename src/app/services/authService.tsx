import api from '../lib/api';
import { LoginRequestDTO, LoginResponseDTO, RegisterRequestDTO, UsuarioResponseDTO, UpdateUserDTO } from '../model/types/auth';

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

  update: async (id: string, userData: UpdateUserDTO): Promise<UsuarioResponseDTO> => {
    const { data } = await api.put<UsuarioResponseDTO>(`/usuarios/${id}`, userData);
    return data;
  },

  uploadPhoto: async (id: string, file: File): Promise<UsuarioResponseDTO> => {
    const formData = new FormData();
    formData.append('foto', file);

    const { data } = await api.put<UsuarioResponseDTO>(`/usuarios/${id}/foto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  getAll: async (): Promise<UsuarioResponseDTO[]> => {
    try {
      const { data } = await api.get<UsuarioResponseDTO[]>('/usuarios/');
      return data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.warn("Usuário sem permissão para listar todos os usuários (403).");
        return [];
      }
      throw error;
    }
  }
};