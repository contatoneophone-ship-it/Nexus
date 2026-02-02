import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DriverRecord } from "../types";

// Helper to get Gemini Client (ensure fresh instance for latest API key)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- ANALYTICS ---

export const analyzeDataPatterns = async (data: DriverRecord[]) => {
  const summary = JSON.stringify(data.slice(0, 50)); // Analyze top 50 for brevity in demo
  
  const prompt = `
    Analise estes dados de horas extras de motoristas. 
    Identifique discrepâncias (outliers), padrões em filiais específicas e oportunidades de redução de custos.
    Amostra de Dados: ${summary}
    
    Retorne um resumo executivo curto em formato Markdown com bullet points.
    Foque em:
    1. Motoristas com excesso de horas extras.
    2. Filiais com turnos noturnos excessivos.
    3. 3 Dicas acionáveis de redução de custos.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um Analista de Dados de RH sênior para uma empresa de logística. Responda sempre em Português do Brasil.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Erro ao analisar dados. Verifique sua chave de API.";
  }
};

// --- CHAT WITH DATA & MAPS ---

export const chatWithData = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  dataContext: string,
  useMaps: boolean = false
) => {
  try {
    const modelName = useMaps ? 'gemini-2.5-flash' : 'gemini-3-pro-preview';
    
    const config: any = {
       systemInstruction: `Você é um assistente útil para o App de Gestão de Horas Extras (Nexus). 
       Dados de Contexto: ${dataContext.substring(0, 20000)}... (truncado se muito longo).
       Responda perguntas sobre motoristas, custos e localizações sempre em Português do Brasil.`,
    };

    if (useMaps) {
      config.tools = [{ googleMaps: {} }];
    }

    const ai = getAiClient();
    const chat = ai.chats.create({
      model: modelName,
      config: config,
      history: history.map(h => ({ role: h.role, parts: h.parts }))
    });

    const result = await chat.sendMessage({ message });
    
    // Check for maps grounding
    let mapLinks = [];
    if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        // Simple extraction for demo purposes
        // In a real app, you would parse this structure strictly
    }

    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Desculpe, encontrei um erro ao processar sua solicitação.";
  }
};

// --- IMAGE GENERATION ---

export const generateImage = async (prompt: string, aspectRatio: string = "16:9") => {
  try {
    // API Key Selection for High-Quality Image Models
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const aistudio = (window as any).aistudio;
        if (await aistudio.hasSelectedApiKey() === false) {
             await aistudio.openSelectKey();
        }
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// --- IMAGE EDITING (NANO BANANA) ---

export const editImage = async (base64Image: string, prompt: string) => {
  try {
    // Remove header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};