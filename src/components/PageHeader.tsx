/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, onBack, actions }: PageHeaderProps) {
  return (
    <div className="bg-brand-dark-red rounded-xl shadow-lg p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white border-b-4 border-brand-red">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-white font-black uppercase tracking-widest text-xs cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="hidden xs:inline">Voltar</span>
        </button>
        <img 
          src="https://www.botafogopraiashopping.com.br/sites/botafogo-praia/files/styles/logo_header/public/shopping-media/Cabe%C3%A7alho%20e%20Rodap%C3%A9/bps_logo_header.png?itok=d7aZA7B_" 
          className="h-10 hidden sm:block" 
          alt="BPS" 
        />
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-extrabold uppercase tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <span className="text-[10px] font-bold text-brand-beige/50 uppercase tracking-[0.2em] mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
