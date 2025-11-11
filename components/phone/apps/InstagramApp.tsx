

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark, PlusSquare, Download, Loader2 } from 'lucide-react';
import { CharacterState, Post, CharacterProfile } from '../../../types';
import { GoogleGenAI } from '@google/genai';
import { generateInstagramRefreshPrompt, parseInstagramRefreshResponse } from '../../../services/geminiService';

interface InstagramAppProps {
    onBack: () => void;
    characterState: CharacterState;
    setCharacterState: React.Dispatch<React.SetStateAction<CharacterState>>;
    ai: GoogleGenAI;
}

// Giao diện xem bình luận
const CommentsView = ({
    post,
    characterProfile,
    onBack,
    onAddComment,
}: {
    post: Post;
    characterProfile: CharacterProfile;
    onBack: () => void;
    onAddComment: (postId: string, commentText: string) => void;
}) => {
    const [visibleCount, setVisibleCount] = useState(5);
    const [newComment, setNewComment] = useState('');
    const commentsToShow = post.comments.slice(0, visibleCount);

    const handlePostComment = () => {
        if (newComment.trim()) {
            onAddComment(post.id, newComment.trim());
            setNewComment('');
        }
    };

    return (
        <div className="bg-white text-black h-full flex flex-col absolute inset-0 animate-zoom-in">
            <header className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <h2 className="font-bold text-center flex-1">Bình luận</h2>
                <div className="w-6"></div> {/* Spacer */}
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <img src={post.avatar} className="w-8 h-8 rounded-full object-cover" alt="post author avatar"/>
                    <p className="text-sm">
                        <span className="font-bold">{post.username}</span> {post.caption}
                    </p>
                </div>

                {commentsToShow.map((comment, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <img src={`https://i.pravatar.cc/40?u=${comment.user}`} className="w-8 h-8 rounded-full object-cover" alt="commenter avatar"/>
                        <p className="text-sm">
                            <span className="font-bold">{comment.user}</span> {comment.text}
                        </p>
                    </div>
                ))}
                
                {post.comments.length > visibleCount && (
                    <button 
                        onClick={() => setVisibleCount(prev => prev + 5)}
                        className="text-sm text-gray-500 font-semibold"
                    >
                        Tải thêm bình luận
                    </button>
                )}
            </div>

            <footer className="p-2 border-t border-gray-200 bg-white flex items-center gap-2">
                <img src={characterProfile.avatar} className="w-9 h-9 rounded-full object-cover" alt="your avatar"/>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={`Bình luận với tư cách ${characterProfile.name}...`}
                    className="flex-1 bg-transparent outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                />
                <button onClick={handlePostComment} className="font-bold text-blue-500 text-sm disabled:text-blue-200" disabled={!newComment.trim()}>
                    Đăng
                </button>
            </footer>
        </div>
    );
};

const InstagramApp: React.FC<InstagramAppProps> = ({ onBack, characterState, setCharacterState, ai }) => {
    const { posts } = characterState.apps.instagram;
    const { profile } = characterState;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const postFileInputRef = useRef<HTMLInputElement>(null);
    const [editingPostId, setEditingPostId] = React.useState<string | null>(null);
    const [viewingCommentsForPostId, setViewingCommentsForPostId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    const handleLike = (postId: string) => {
        setLikedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };
    
    useEffect(() => {
        const refreshFeed = async () => {
            setIsRefreshing(true);
            try {
                const prompt = generateInstagramRefreshPrompt(characterState);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [{ text: prompt }] },
                    config: { responseMimeType: "application/json" },
                });
                const newPostData = parseInstagramRefreshResponse(response.text);
                
                if (newPostData && newPostData.length > 0) {
                    const newPosts: Post[] = newPostData.map((postData, index) => ({
                        id: `post_${Date.now()}_${index}`,
                        username: characterState.profile.name,
                        avatar: characterState.profile.avatar,
                        image: postData.image,
                        caption: postData.caption,
                        song: postData.song,
                        timestamp: 'Vừa xong',
                        likes: Math.floor(Math.random() * 5000) + 70000,
                        comments: [],
                    }));

                    setCharacterState(prev => {
                        const existingCaptions = new Set(prev.apps.instagram.posts.map(p => p.caption));
                        const trulyNewPosts = newPosts.filter(p => !existingCaptions.has(p.caption));
                        
                        if (trulyNewPosts.length === 0) return prev;

                        return {
                            ...prev,
                            apps: {
                                ...prev.apps,
                                instagram: {
                                    posts: [...trulyNewPosts, ...prev.apps.instagram.posts]
                                }
                            }
                        };
                    });
                }
            } catch (error) {
                console.error("Lỗi khi làm mới Instagram feed:", error);
            } finally {
                setIsRefreshing(false);
            }
        };

        refreshFeed();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy một lần khi ứng dụng được mở


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'post', postId?: string) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                if (type === 'avatar') {
                    setCharacterState(prev => ({
                        ...prev,
                        profile: { ...prev.profile, avatar: imageUrl },
                        apps: { ...prev.apps, instagram: { posts: prev.apps.instagram.posts.map(p => p.username === profile.name ? {...p, avatar: imageUrl} : p) }}
                    }));
                } else if (type === 'post' && postId) {
                    setCharacterState(prev => ({
                        ...prev,
                        apps: { ...prev.apps, instagram: { posts: prev.apps.instagram.posts.map(p => p.id === postId ? {...p, image: imageUrl} : p) }}
                    }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleDownloadImage = async (imageUrl: string, postId: string) => {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Phản hồi mạng không ổn');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `instagram_${postId}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
            window.open(imageUrl, '_blank');
        }
    };

    const handleAddComment = (postId: string, commentText: string) => {
        setCharacterState(prev => {
            const newPosts = prev.apps.instagram.posts.map(p => {
                if (p.id === postId) {
                    const newComment = { user: prev.profile.name, text: commentText };
                    return { ...p, comments: [...p.comments, newComment] };
                }
                return p;
            });
            return { ...prev, apps: { ...prev.apps, instagram: { posts: newPosts } } };
        });
    };

    const postToView = viewingCommentsForPostId ? posts.find(p => p.id === viewingCommentsForPostId) : null;

    if (postToView) {
        return (
            <CommentsView 
                post={postToView} 
                characterProfile={profile}
                onBack={() => setViewingCommentsForPostId(null)} 
                onAddComment={handleAddComment}
            />
        );
    }


    return (
        <div className="bg-white text-black h-full flex flex-col">
            <header className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <h1 className="text-2xl font-handwriting">Instagram</h1>
                <div className="flex items-center gap-4">
                     <PlusSquare size={24}/>
                     <Heart size={24}/>
                     <Send size={24}/>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                 {isRefreshing && (
                    <div className="flex justify-center items-center p-4 border-b border-gray-200">
                        <Loader2 className="animate-spin text-gray-500" size={24} />
                    </div>
                )}
                 {/* Profile Header */}
                <div className="flex items-center p-4">
                     <div className="relative group">
                        <img src={profile.avatar} className="w-20 h-20 rounded-full object-cover" alt="profile avatar"/>
                         <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                    </div>
                    <div className="flex-1 ml-4 flex justify-around items-center">
                        <div className="text-center"><p className="font-bold">{posts.filter(p=>p.username===profile.name).length}</p><p className="text-sm text-gray-500">Bài viết</p></div>
                        <div className="text-center"><p className="font-bold">1.2M</p><p className="text-sm text-gray-500">Người theo dõi</p></div>
                        <div className="text-center"><p className="font-bold">5</p><p className="text-sm text-gray-500">Đang theo dõi</p></div>
                    </div>
                </div>
                <div className="px-4 pb-4">
                    <p className="font-bold">{profile.name}</p>
                    <p className="text-sm text-gray-600">Kiến trúc sư | Nghệ sĩ dương cầm</p>
                </div>

                {/* Feed */}
                <div>
                    {posts.map(post => (
                        <div key={post.id} className="border-t border-gray-200">
                            <div className="flex items-center p-3">
                                <img src={post.avatar} className="w-8 h-8 rounded-full object-cover" alt="post author avatar"/>
                                <span className="font-bold ml-3 text-sm">{post.username}</span>
                            </div>
                            <div className="relative group">
                                <img src={post.image} className="w-full h-auto" alt="post content"/>
                                {likedPosts.has(post.id) && (
                                     <Heart fill="red" stroke="none" size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 animate-ping-once" />
                                )}
                                <button onClick={() => {setEditingPostId(post.id); postFileInputRef.current?.click()}} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                </button>
                            </div>
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Heart 
                                            size={24} 
                                            className={`cursor-pointer transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'hover:text-red-500'}`}
                                            fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                                            onClick={() => handleLike(post.id)}
                                        />
                                        <MessageCircle size={24} className="cursor-pointer" onClick={() => setViewingCommentsForPostId(post.id)}/>
                                        <Send size={24} className="cursor-pointer"/>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Download 
                                            size={24} 
                                            className="cursor-pointer" 
                                            onClick={() => handleDownloadImage(post.image, post.id)}
                                            aria-label="Lưu ảnh"
                                        />
                                        <Bookmark size={24} className="cursor-pointer"/>
                                    </div>
                                </div>
                                <p className="font-bold text-sm mt-2">{post.likes.toLocaleString()} lượt thích</p>
                                <p className="text-sm mt-1">
                                    <span className="font-bold">{post.username}</span> {post.caption}
                                </p>
                                {post.song && <p className="text-xs text-gray-500 mt-1">♪ {post.song}</p>}
                                {post.comments.length > 0 && (
                                    <div className="text-sm mt-2 space-y-1">
                                        <p className="cursor-pointer text-gray-500" onClick={() => setViewingCommentsForPostId(post.id)}>
                                            Xem tất cả {post.comments.length} bình luận
                                        </p>
                                        <p>
                                            <span className="font-bold">{post.comments[0].user}</span> {post.comments[0].text}
                                        </p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2">{post.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    <input type="file" accept="image/*" ref={postFileInputRef} onChange={(e) => handleFileChange(e, 'post', editingPostId || undefined)} className="hidden" />
                </div>
            </div>
            <style>{`
                @keyframes ping-once {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    75%, 100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                .animate-ping-once {
                    animation: ping-once 0.6s cubic-bezier(0, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default InstagramApp;