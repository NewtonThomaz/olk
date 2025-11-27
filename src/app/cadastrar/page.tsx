'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Cadastrar() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const { register, loading, error: apiError } = useAuth();

  useEffect(() => {
    setPasswordValidations({
      length: senha.length >= 8,
      uppercase: /[A-Z]/.test(senha),
      lowercase: /[a-z]/.test(senha),
      number: /[0-9]/.test(senha),
      special: /[@#$%^&+=!]/.test(senha)
    });
  }, [senha]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isPasswordValid) {
      setFormError("A senha não atende a todos os requisitos de segurança.");
      return;
    }

    if (senha !== confirmSenha) {
      setFormError("As senhas não coincidem.");
      return;
    }

    if (nome.trim().length < 3) {
      setFormError("O nome deve ter no mínimo 3 caracteres.");
      return;
    }

    await register({
      nome,
      email,
      senha
    });
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#6d9138] flex items-center justify-center px-4">

      <section className="w-full max-w-sm md:max-w-md flex flex-col items-center transition-all duration-300 relative">

        <section className="w-full flex justify-start mb-4">
          <Link href="/">
            <button type="button" className="text-white hover:bg-white/10 rounded-full transition-colors p-2">
              <ArrowLeft className="h-8 w-8" strokeWidth={2} />
            </button>
          </Link>
        </section>

       <header className="mb-12 flex flex-col items-center justify-center w-full">
          <figure className="w-[65dvw] md:w-[22dvw] h-auto relative flex justify-center transition-all duration-100">
            <Image
              src="/logoBranco.png"
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

        <form className="w-full space-y-4 rounded-2xl backdrop-blur-sm" onSubmit={handleSubmit}>

          {(formError || apiError) && (
            <div className="p-3 text-sm text-red-600 bg-white/95 border border-red-200 rounded-lg text-center animate-in fade-in">
              {formError || apiError}
            </div>
          )}

          <div className="space-y-4">
            <label className="relative group block w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-6 w-6 text-white/80" strokeWidth={1.5} />
              </span>
              <input
                type="text"
                placeholder="Nome Completo"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-white rounded-full text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/10 transition-all bg-transparent"
              />
            </label>

            <label className="relative group block w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-6 w-6 text-white/80" strokeWidth={1.5} />
              </span>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-white rounded-full text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/10 transition-all bg-transparent"
              />
            </label>

            <div className="space-y-2">
              <label className="relative group block w-full">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`block w-full pl-12 pr-12 py-3 border rounded-full text-white placeholder-white/60 focus:outline-none focus:bg-white/10 transition-all bg-transparent ${senha && !isPasswordValid ? 'border-red-300/70' : 'border-white focus:border-white'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </label>

              {senha && (
                <div className="bg-black/20 p-3 rounded-lg text-xs space-y-1 transition-all">
                  <p className="text-white/50 mb-2 font-semibold">A senha deve conter:</p>

                  <ValidationItem isValid={passwordValidations.length} text="Mínimo 8 caracteres" />
                  <ValidationItem isValid={passwordValidations.uppercase} text="Letra Maiúscula" />
                  <ValidationItem isValid={passwordValidations.lowercase} text="Letra Minúscula" />
                  <ValidationItem isValid={passwordValidations.number} text="Número" />
                  <ValidationItem isValid={passwordValidations.special} text="Símbolo (@ # $ % ^ & + = !)" />
                </div>
              )}
            </div>

            <label className="relative group block w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-6 w-6 text-white/80" strokeWidth={1.5} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a senha"
                required
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                className={`block w-full pl-12 pr-12 py-3 border border-white rounded-full text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/10 transition-all bg-transparent ${confirmSenha && senha !== confirmSenha ? 'border-red-300/70' : ''
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </button>
            </label>
          </div>

          <button
            disabled={loading || !isPasswordValid || senha !== confirmSenha}
            className="w-full mt-4 py-3.5 rounded-full bg-white text-[#6d9138] font-bold text-lg shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center disabled:transform-none"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6 text-[#6d9138]" /> : 'Criar Conta'}
          </button>

        </form>

      </section>
    </main>
  );
}

function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${isValid ? 'text-green-400' : 'text-white/60'}`}>
      {isValid ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-white/40 ml-1 mr-0.5" />}
      <span>{text}</span>
    </div>
  );
}