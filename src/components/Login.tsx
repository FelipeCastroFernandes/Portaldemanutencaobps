/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Lock, Mail, UserPlus } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (data: { email?: string; username?: string; password?: string }) => boolean;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }

    const success = onLogin({ username, password });
    if (!success) {
      setError('E-mail ou senha incorretos');
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    
    // Simulate sending recovery email
    setRecoverySent(true);
    setTimeout(() => {
      setIsRecovering(false);
      setRecoverySent(false);
      setRecoveryEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 flex-col">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-dark-red p-8 rounded-2xl shadow-2xl w-full max-w-md border-b-8 border-brand-red overflow-hidden"
      >
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://www.botafogopraiashopping.com.br/sites/botafogo-praia/files/styles/logo_header/public/shopping-media/Cabe%C3%A7alho%20e%20Rodap%C3%A9/bps_logo_header.png?itok=d7aZA7B_" 
            alt="Logo BPS" 
            className="h-16 mb-6"
          />
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter text-center">
            Portal de Manutenção
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {!isRecovering ? (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">E-mail Corporativo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-dark-red/50">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-red/30 transition-all font-medium"
                    placeholder="exemplo@botafogopraia.com.br"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">Senha</label>
                  <button 
                    type="button"
                    onClick={() => setIsRecovering(true)}
                    className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-dark-red/50">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-red/30 transition-all font-medium"
                    placeholder="Informe sua senha..."
                  />
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/20 text-red-100 text-[10px] font-bold uppercase tracking-widest p-2 rounded-lg text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full bg-brand-bg text-brand-dark-red font-black py-4 px-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl uppercase tracking-widest text-xs mt-6 group"
              >
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                Entrar no Sistema
              </button>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                <div className="text-center">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em]">
                    Acessos Rápidos de Teste
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin@botafogopraia.com.br');
                      setPassword('bps');
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-xl text-left border border-white/5 flex flex-col justify-between cursor-pointer"
                  >
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Administrador</span>
                    <span className="text-[11px] font-bold text-stone-100 mt-1">admin / bps</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('teste@botafogopraia.com.br');
                      setPassword('123');
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-xl text-left border border-white/5 flex flex-col justify-between cursor-pointer"
                  >
                    <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Técnico</span>
                    <span className="text-[11px] font-bold text-stone-100 mt-1">teste / 123</span>
                  </button>
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="recovery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRecovery} 
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-white font-black uppercase tracking-widest text-xs mb-2">Recuperar Senha</h2>
                <p className="text-white/50 text-[10px] leading-relaxed">
                  Informe o seu e-mail corporativo abaixo para enviarmos as instruções de recuperação.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-white/50 tracking-widest pl-1">E-mail Corporativo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-dark-red/50">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-red/30 transition-all font-medium"
                    placeholder="exemplo@botafogopraia.com.br"
                  />
                </div>
              </div>

              <div className="pt-2">
                {recoverySent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/20 text-emerald-100 text-[10px] font-bold uppercase tracking-widest p-4 rounded-xl text-center border border-emerald-500/30"
                  >
                    E-mail de recuperação enviado! Verifique sua caixa de entrada.
                  </motion.div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-brand-bg text-brand-dark-red font-black py-4 px-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl uppercase tracking-widest text-xs group"
                  >
                    Enviar Link de Recuperação
                  </button>
                )}
              </div>

              {!recoverySent && (
                <button 
                  type="button"
                  onClick={() => setIsRecovering(false)}
                  className="w-full text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-[0.2em] pt-2"
                >
                  Voltar para o login
                </button>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] font-bold text-white/30 mt-10 uppercase tracking-widest">
          Botafogo Praia Shopping © 2026
        </p>
      </motion.div>
    </div>
  );
}
