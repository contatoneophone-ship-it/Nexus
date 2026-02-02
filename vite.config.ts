import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We use process.cwd() safely by casting to any to avoid TS errors in some envs.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize system env vars (Vercel/Netlify) over .env files
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the Google GenAI SDK
      // This replaces 'process.env.API_KEY' in the code with the actual string value during build
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  }
})