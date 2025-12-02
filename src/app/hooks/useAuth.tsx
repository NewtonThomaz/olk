'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { LoginRequestDTO, RegisterRequestDTO, UsuarioResponseDTO, UpdateUserDTO } from '../model/types/auth';

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UsuarioResponseDTO | null>(null);

  const getUserIdFromToken = (token: string): string | null => {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = JSON.parse(atob(payloadBase64));
      return decodedJson.id;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nextgen_token');
      if (token) {
        const userId = getUserIdFromToken(token);
        if (userId) {
          authService.getUserById(userId)
            .then((userData) => setUser(userData))
            .catch(() => logout());
        }
      }
    }
  }, []);

  const login = async (credentials: LoginRequestDTO) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('nextgen_token', data.token);
      
      const userId = getUserIdFromToken(data.token);
      if (userId) {
        const userData = await authService.getUserById(userId);
        setUser(userData);
      }

      router.push('/home'); 
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Email ou senha incorretos.');
      } else {
        setError('Erro ao conectar com o servidor. Senha ou Email invalido');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequestDTO) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      router.push('/'); 
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError('Dados inválidos ou email já cadastrado.');
      } else {
        setError('Erro ao criar conta. Email ja registrado');
      }
    } finally {
      setLoading(false);
    }
  };

  // Atualiza dados de texto (Nome, Senha)
  const updateProfile = async (updateData: UpdateUserDTO) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.update(user.id, updateData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      console.error(err);
      setError('Erro ao atualizar perfil.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO: Atualiza especificamente a foto enviando o arquivo bruto
  const updatePhoto = async (file: File) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.uploadPhoto(user.id, file);
      // Força uma atualização da URL da imagem adicionando um timestamp para evitar cache do navegador
      if (updatedUser.fotoPerfil) {
        updatedUser.fotoPerfil = `${updatedUser.fotoPerfil}?t=${new Date().getTime()}`;
      }
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      console.error(err);
      setError('Erro ao fazer upload da foto.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nextgen_token');
    setUser(null);
    router.push('/');
  };

  return {
    login,
    register,
    logout,
    updateProfile,
    updatePhoto, // Exportando a nova função
    user,
    loading,
    error
  };
}