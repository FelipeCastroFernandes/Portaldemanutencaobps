import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  let supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
  let supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Handle case where user input the URL in both variables, or has it blank
  if (supabaseAnonKey.startsWith('http') || supabaseAnonKey === supabaseUrl || !supabaseAnonKey) {
    if (env.SUPABASE_SERVICE_ROLE_KEY && (env.SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_pub') || env.SUPABASE_SERVICE_ROLE_KEY.includes('.'))) {
      supabaseAnonKey = env.SUPABASE_SERVICE_ROLE_KEY;
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'process.env': {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
      }
    }
  };
});
