
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Wand2, Loader2 } from 'lucide-react';

interface AvatarGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (base64Image: string) => void;
    ai: GoogleGenAI;
}

const AvatarGeneratorModal: React.FC<AvatarGeneratorModalProps> = ({ isOpen, onClose, onSelectImage, ai }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Vui lòng nhập mô tả.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });
            
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setGeneratedImage(imageUrl);
            } else {
                setError('Không thể tạo ảnh. Vui lòng thử lại với mô tả khác.');
            }
        } catch (err) {
            console.error("Lỗi tạo ảnh:", err);
            setError('Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = () => {
        if (generatedImage) {
            onSelectImage(generatedImage);
            handleClose();
        }
    };

    const handleClose = () => {
        setPrompt('');
        setGeneratedImage(null);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md relative flex flex-col gap-4">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold text-center text-teal-300">Tạo ảnh đại diện AI</h2>

                <div className="flex flex-col gap-2">
                    <label htmlFor="prompt" className="text-sm font-medium text-gray-300">Mô tả ảnh</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ví dụ: một chàng trai châu Á tóc đen, mắt nâu, phong cách anime..."
                        className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-24"
                        disabled={isLoading}
                    />
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-48 bg-gray-800 rounded-md">
                        <Loader2 className="animate-spin text-teal-400" size={40} />
                        <p className="mt-2 text-gray-300">Đang tạo ảnh...</p>
                    </div>
                )}

                {generatedImage && !isLoading && (
                    <div className="flex flex-col items-center gap-4">
                        <img src={generatedImage} alt="Generated Avatar" className="w-48 h-48 rounded-lg object-cover border-2 border-teal-400" />
                        <div className="flex gap-4">
                            <button onClick={handleGenerate} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Thử lại
                            </button>
                            <button onClick={handleSelect} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Dùng ảnh này
                            </button>
                        </div>
                    </div>
                )}
                
                {!generatedImage && !isLoading && (
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-600"
                    >
                        <Wand2 size={20} />
                        Tạo ảnh
                    </button>
                )}
            </div>
        </div>
    );
};

export default AvatarGeneratorModal;
