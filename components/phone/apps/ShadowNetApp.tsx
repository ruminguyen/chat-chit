import React, { useState } from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';
import { ShadowNetState, ExclusiveNewsArticle } from '../../../types';

interface ShadowNetAppProps {
    onBack: () => void;
    shadowNetState: ShadowNetState;
}

const ArticleView = ({ article, onBack }: { article: ExclusiveNewsArticle, onBack: () => void }) => {
    return (
        <div className="absolute inset-0 bg-black text-green-400 font-mono flex flex-col z-20 animate-zoom-in">
             <header className="flex items-center p-2 border-b border-green-400/30 flex-shrink-0">
                <button onClick={onBack} className="text-green-400 hover:bg-green-400/10 p-1"><ArrowLeft size={20} /></button>
                <h2 className="text-sm ml-2 truncate">doc_{article.id}.txt</h2>
            </header>
            <div className="flex-1 p-3 overflow-y-auto text-sm">
                <p className="text-lg font-bold whitespace-pre-wrap">{article.headline}</p>
                <p className="text-xs text-green-600 my-2">
                    &gt; Nguồn: {article.source} <br/>
                    &gt; Thời gian: {article.timestamp}
                </p>
                <div className="w-full h-px bg-green-400/30 my-3"></div>
                <p className="whitespace-pre-wrap leading-relaxed">{article.content}</p>
                 <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1"></span>
            </div>
        </div>
    );
};


const ShadowNetApp: React.FC<ShadowNetAppProps> = ({ onBack, shadowNetState }) => {
    const { articles } = shadowNetState;
    const [selectedArticle, setSelectedArticle] = useState<ExclusiveNewsArticle | null>(null);

    if (selectedArticle) {
        return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
    }

    return (
        <div className="bg-black text-green-400 h-full flex flex-col font-mono">
            <header className="flex items-center p-3 border-b border-green-400/30 sticky top-0 bg-black z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <Terminal size={20} className="ml-4 mr-2"/>
                <h1 className="text-xl font-bold">ShadowNet</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-2">
                <p className="text-xs text-green-700 p-1">&gt; Tải bản tin mới nhất...</p>
                <ul>
                    {articles.map(article => (
                        <li 
                            key={article.id} 
                            onClick={() => setSelectedArticle(article)}
                            className="p-2 border-b border-green-900 cursor-pointer hover:bg-green-400/10"
                        >
                            <p className="font-bold text-sm truncate">{article.headline}</p>
                            <div className="flex justify-between text-xs text-green-600 mt-1">
                                <span>[Nguồn: {article.source}]</span>
                                <span>{article.timestamp}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                 <p className="text-xs text-green-700 p-1 mt-2">&gt; Kết thúc luồng dữ liệu.</p>
            </div>
        </div>
    );
};

export default ShadowNetApp;
