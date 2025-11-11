

import { CharacterState, ParsedResponse, UserProfile, Message, PatchOperation } from '../types';
import { getSystemInstruction, phoneUpdateSystemInstruction } from '../constants';

/**
 * Generates the full system instruction prompt for the Gemini API for chatting.
 * It combines the base instruction with the current character state and user profile.
 */
export const generateGeminiPrompt = (characterState: CharacterState, userProfile: UserProfile): string => {
    const currentStateInfo = `
    ---
    BỐI CẢNH HIỆN TẠI (ĐỂ BẠN GHI NHỚ, KHÔNG CẦN NHẮC LẠI):
    - Tên người dùng (người bạn đang trò chuyện): ${userProfile.name}.
    - Điểm mối quan hệ hiện tại của bạn với họ: ${characterState.relationship.score}.
    - Trạng thái mối quan hệ: ${getRelationshipLevel(characterState.relationship.score)}.
    - Dữ liệu trên điện thoại của bạn: ${JSON.stringify(characterState.apps)}
    ---
    `;
    const systemInstruction = getSystemInstruction(characterState.bio);
    return systemInstruction + currentStateInfo;
};

/**
 * Generates the prompt for the Gemini API to update the phone's state.
 */
export const generatePhoneUpdatePrompt = (chatHistory: Message[], characterState: CharacterState): string => {
    const historyText = chatHistory
        .slice(-10) // Lấy 10 tin nhắn cuối cùng để làm ngữ cảnh
        .map(m => `${m.sender === 'user' ? 'User' : 'Character'}: ${m.text}`).join('\n');
    return `
${phoneUpdateSystemInstruction}

---
DỮ LIỆU HIỆN TẠI (để bạn có thể thêm vào hoặc sửa đổi):
${JSON.stringify(characterState.apps)}
---
LỊCH SỬ TRÒ CHUYỆN GẦN ĐÂY (dựa vào đây để cập nhật):
${historyText}
---

Bây giờ, hãy trả về mảng JSON chứa các hành động cập nhật. Nếu không có gì thay đổi, hãy trả về [].
`;
};

/**
 * Generates a prompt for Gemini to create new Instagram posts.
 */
export const generateInstagramRefreshPrompt = (characterState: CharacterState): string => {
    const existingCaptions = characterState.apps.instagram.posts.map(p => `- ${p.caption}`).join('\n');
    return `
BẠN LÀ TRÍ TUỆ NHÂN TẠO NHẬP VAI Alex Moretti.
Nhiệm vụ của bạn là tạo ra 1 đến 2 bài đăng Instagram mới mà nhân vật có thể đã đăng gần đây, dựa trên tính cách và các sự kiện trong cuộc trò chuyện.
Các bài đăng phải mới và không trùng lặp với các bài đã có.

THÔNG TIN NHÂN VẬT (để tham khảo):
${characterState.bio}

CÁC BÀI ĐĂNG HIỆN CÓ (chỉ xem caption để tránh trùng lặp):
${existingCaptions}

Hãy trả lời bằng một MẢNG JSON chứa các đối tượng bài đăng. KHÔNG viết gì khác ngoài mảng JSON.
Mỗi đối tượng phải có cấu trúc:
{
  "image": "URL_HINH_ANH_TU_UNSPLASH_HOAC_TUONG_TU_PHU_HOP_VOI_NOI_DUNG",
  "caption": "Nội dung bài đăng",
  "song": "Tên bài hát (tùy chọn)"
}

Ví dụ đầu ra:
[
  {
    "image": "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=800",
    "caption": "Sự im lặng đôi khi là câu trả lời đanh thép nhất.",
    "song": "Chopin - Nocturne op.9 No.2"
  }
]
`;
};


/**
 * Parses the raw string response from Gemini for chat, which is expected to be a JSON string.
 * It safely attempts to parse the JSON and provides a fallback if parsing fails.
 */
export const parseGeminiResponse = (response: string): ParsedResponse => {
    try {
        const cleanedResponse = response.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(cleanedResponse);

        if (typeof parsed.response !== 'string') {
            throw new Error("Phản hồi JSON thiếu trường 'response' bắt buộc.");
        }

        return {
            response: parsed.response,
            relationshipChange: parsed.relationshipChange,
            innerThought: parsed.innerThought,
            gift: parsed.gift,
            action: parsed.action,
        };
    } catch (error) {
        console.error("Lỗi khi phân tích phản hồi JSON từ Gemini (chat):", error);
        console.error("Phản hồi gốc:", response);
        return { response };
    }
};

/**
 * Parses the raw string response from Gemini for phone state update.
 * It expects a JSON array of patch operations.
 */
export const parsePhoneUpdateResponse = (response: string): PatchOperation[] | null => {
    try {
        const cleanedResponse = response.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        if (!cleanedResponse.trim() || !cleanedResponse.trim().startsWith('[')) {
            return [];
        }
        const parsed = JSON.parse(cleanedResponse);

        if (Array.isArray(parsed)) {
            for (const op of parsed) {
                if (!op.op || !op.path) {
                    throw new Error("Thao tác cập nhật không hợp lệ, thiếu 'op' hoặc 'path'.");
                }
            }
            return parsed as PatchOperation[];
        }
        
        throw new Error("Phản hồi JSON không phải là một mảng các thao tác cập nhật.");

    } catch (error) {
        console.error("Lỗi khi phân tích phản hồi JSON từ Gemini (phone update patch):", error);
        console.error("Phản hồi gốc:", response);
        return null;
    }
};

/**
 * Parses the raw string response from Gemini for Instagram refresh.
 * It expects a JSON array of partial post objects.
 */
export const parseInstagramRefreshResponse = (response: string): { image: string, caption: string, song?: string }[] => {
    try {
        const cleanedResponse = response.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        if (!cleanedResponse.trim()) {
            return [];
        }
        const parsed = JSON.parse(cleanedResponse);
        if (Array.isArray(parsed)) {
            // Basic validation to ensure the items have the required properties
            return parsed.filter(item => typeof item.image === 'string' && typeof item.caption === 'string');
        }
        return [];
    } catch (error) {
        console.error("Lỗi khi phân tích phản hồi JSON từ Gemini (Instagram refresh):", error);
        console.error("Phản hồi gốc:", response);
        return [];
    }
};


/**
 * Generates a prompt for suggesting user replies.
 */
export const generateSuggestionPrompt = (chatHistory: Message[], currentInput: string): string => {
    const historyText = chatHistory
        .slice(-6) // Take last 6 messages for context
        .map(m => `${m.sender === 'user' ? 'User' : 'Character'}: ${m.text}`)
        .join('\n');

    return `
Dựa vào lịch sử trò chuyện gần đây và những gì người dùng đang gõ, hãy gợi ý 3 câu trả lời ngắn gọn, tự nhiên và phù hợp với ngữ cảnh cho người dùng.
Luôn trả lời bằng một mảng JSON chứa 3 chuỗi. Ví dụ: ["Tuyệt vời!", "Anh đang làm gì vậy?", "Kể em nghe thêm đi."].
KHÔNG thêm bất kỳ giải thích nào. Chỉ trả về mảng JSON.

---
LỊCH SỬ TRÒ CHUYỆN:
${historyText}
---
NGƯỜI DÙNG ĐANG GÕ:
"${currentInput}"
---

Bây giờ, hãy trả về mảng JSON chứa 3 gợi ý.
`;
};

/**
 * Parses the raw string response from Gemini for suggestions.
 * It expects a JSON array of strings.
 */
export const parseSuggestionResponse = (response: string): string[] => {
    try {
        const cleanedResponse = response.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(cleanedResponse);

        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            return parsed;
        }
        
        console.warn("Phản hồi gợi ý không phải là một mảng chuỗi:", parsed);
        return [];
    } catch (error) {
        console.error("Lỗi khi phân tích phản hồi JSON từ Gemini (suggestions):", error);
        console.error("Phản hồi gốc:", response);
        // Try to extract suggestions from a plain text list if JSON fails
        const lines = response.split('\n').map(l => l.trim().replace(/^- \s*/, '').replace(/^"|"$/g, '')).filter(Boolean);
        if (lines.length > 0) return lines;

        return [];
    }
};


/**
 * Determines the relationship level string based on the score.
 */
const getRelationshipLevel = (score: number): string => {
    if (score <= -100) return 'Đang cháy';
    if (score <= -20) return 'Khó chịu';
    if (score < 0) return 'Xa cách';
    if (score < 20) return 'Người lạ';
    if (score < 100) return 'Quen biết';
    if (score < 1000) return 'Bạn bè';
    if (score < 2000) return 'Cảm nắng';
    if (score < 5000) return 'Người yêu';
    return 'Đối tác';
};