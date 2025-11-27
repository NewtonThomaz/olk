'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { LoginRequestDTO, RegisterRequestDTO, UsuarioResponseDTO } from '../model/types/auth';

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
      // alert('Conta criada com sucesso! Faça login para continuar.');
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

  const logout = () => {
    localStorage.removeItem('nextgen_token');
    setUser(null);
    router.push('/');
  };

  return {
    login,
    register,
    logout,
    user,
    loading,
    error
  };
}