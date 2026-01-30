
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Song } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithAI = async (message: string, history: any[], library: Song[]) => {
  const ai = getAI();
  
  // Tạo ngữ cảnh danh sách nhạc cho AI
  const libraryContext = `Hiện tại thư viện nhạc của chúng ta có các bài sau:
${library.map(s => `- ID: ${s.id}, Tên: ${s.title}, Nghệ sĩ: ${s.artist}, Thể loại: ${s.genre}`).join('\n')}
Nếu người dùng yêu cầu nghe, hãy sử dụng cú pháp [PLAY:ID] ở cuối tin nhắn.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: `${libraryContext}\n\nNgười dùng nói: ${message}` }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      }
    });

    return response.text || "Mình chưa nghe rõ, bạn nói lại được không? 🎵";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Micro của mình hơi trục trặc một chút (API Error), nhưng mình vẫn ở đây với bạn! 🔥";
  }
};
export const getLyricsFromAI = async (title: string, artist: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Hãy tìm lời đầy đủ của bài hát "${title}" của nghệ sĩ "${artist}". 
      Trả về nội dung lời bài hát thuần túy, không thêm lời dẫn, không thêm markdown, chỉ có lời bài hát. 
      Nếu không tìm thấy, trả về "Không tìm thấy lời bài hát".`,
      config: { temperature: 0.2 }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Lyrics AI Error:", error);
    return "Lỗi khi lấy lời bài hát bằng AI.";
  }
};

export const getMusicRecommendations = async (mood: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dựa trên tâm trạng: "${mood}", hãy đề xuất 3 bài hát nổi tiếng. Trả về mảng JSON gồm các object: title, artist.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING }
            },
            required: ["title", "artist"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Recommendation Error:", error);
    return [];
  }
};
