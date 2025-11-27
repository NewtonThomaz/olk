'use client';

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { login, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, senha });
  };

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 font-sans">
      <section className="w-full max-w-sm md:max-w-md flex flex-col items-center transition-all duration-300">
        
        <header className="mb-12 flex flex-col items-center justify-center w-full">
          <figure className="w-[65dvw] md:w-[22dvw] h-auto relative flex justify-center transition-all duration-100">
            <Image 
              src="/logo.png" 
              alt="Logo NextGen Agricultural Technology"
              width={0}
              height={0}
              sizes="(max-width: 768px) 128px, 192px"
              style={{ width: '100%', height: 'auto' }} 
              className="object-contain"
              priority
            />
          </figure>
        </header>

        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <label className="relative group block w-full">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className="h-6 w-6 text-gray-800 group-focus-within:text-[#658D37] transition-colors" strokeWidth={1.5} />
            </span>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-14 pr-4 py-3.5 border border-black rounded-full text-gray-900 placeholder-gray-800 focus:outline-none focus:border-[#658D37] focus:ring-1 focus:ring-[#658D37] transition-all bg-transparent text-lg"
            />
          </label>

          <label className="relative group block w-full">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className="h-6 w-6 text-gray-800 group-focus-within:text-[#658D37] transition-colors" strokeWidth={1.5} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="block w-full pl-14 pr-12 py-3.5 border border-black rounded-full text-gray-900 placeholder-gray-800 focus:outline-none focus:border-[#658D37] focus:ring-1 focus:ring-[#658D37] transition-all bg-transparent text-lg"
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#658D37] transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-6 w-6" strokeWidth={1.5} />
              ) : (
                <Eye className="h-6 w-6" strokeWidth={1.5} />
              )}
            </button>
          </label>

          <button
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-full text-white font-semibold text-lg shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            style={{
              background: 'linear-gradient(90deg, #6e8e38 0%, #9cc53b 100%)'
            }}
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Entrar'}
          </button>

        </form>

        <footer className="mt-6 text-center">
          <p className="text-black text-sm font-medium">
            Ainda não possui uma conta?{' '}
            <Link href="/cadastrar" className="text-[#6e8e38] font-bold hover:underline">
              Criar conta
            </Link>
          </p>
        </footer>

      </section>
    </main>
  );
}