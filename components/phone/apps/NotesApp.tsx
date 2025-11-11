
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Note, CharacterState } from '../../../types';

interface NotesAppProps {
    onBack: () => void;
    notes: Note[];
    setCharacterState: React.Dispatch<React.SetStateAction<CharacterState>>;
}

// Trình soạn thảo ghi chú
const NoteEditor = ({ 
    note, 
    onBack, 
    onUpdate, 
    onDelete 
}: { 
    note: Note, 
    onBack: () => void, 
    onUpdate: (note: Note) => void, 
    onDelete: (noteId: string) => void 
}) => {
    // Sử dụng state cục bộ để tránh render lại toàn bộ cây khi gõ
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);

    // Sử dụng useEffect để đồng bộ hóa state nếu `note` prop thay đổi từ bên ngoài
    React.useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
    }, [note]);


    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        onUpdate({ ...note, title: e.target.value });
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        onUpdate({ ...note, content: e.target.value });
    };

    return (
        <div className="absolute inset-0 bg-[#FFF5F8] flex flex-col animate-slide-in-right z-20">
            <header className="flex items-center justify-between p-3 border-b border-pink-200 flex-shrink-0">
                <button onClick={onBack} className="p-1 rounded-full hover:bg-pink-100"><ArrowLeft size={24} /></button>
                <h1 className="text-lg font-bold truncate mx-2 text-pink-800">{title || 'Ghi chú mới'}</h1>
                <button onClick={() => onDelete(note.id)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-500/10"><Trash2 size={20} /></button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Tiêu đề"
                    className="w-full bg-transparent text-pink-900 text-2xl font-bold outline-none mb-4 placeholder-pink-300"
                />
                <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Nội dung..."
                    className="w-full h-full bg-transparent text-pink-800 outline-none resize-none text-base placeholder-pink-300"
                />
            </div>
        </div>
    );
};


const NotesApp: React.FC<NotesAppProps> = ({ onBack, notes, setCharacterState }) => {
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const handleSelectNote = (note: Note) => {
        setEditingNote(note);
    };

    const handleNewNote = () => {
        const newNote: Note = {
            id: `note_${Date.now()}`,
            title: '',
            content: ''
        };
        setCharacterState(prevState => ({
            ...prevState,
            apps: {
                ...prevState.apps,
                notes: [newNote, ...prevState.apps.notes]
            }
        }));
        setEditingNote(newNote);
    };

    const handleUpdateNote = (updatedNote: Note) => {
        setCharacterState(prevState => ({
            ...prevState,
            apps: {
                ...prevState.apps,
                notes: prevState.apps.notes.map(n => n.id === updatedNote.id ? updatedNote : n)
            }
        }));
    };
    
    const handleDeleteNote = (noteId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
            setCharacterState(prevState => ({
                ...prevState,
                apps: {
                    ...prevState.apps,
                    notes: prevState.apps.notes.filter(n => n.id !== noteId)
                }
            }));
            setEditingNote(null);
        }
    };

    return (
        <div className="bg-[#FFF5F8] text-pink-900 h-full flex flex-col relative overflow-hidden">
            <header className="flex items-center justify-between p-3 border-b border-pink-200 sticky top-0 bg-[#FFF5F8] z-10">
                <div className="flex items-center">
                    <button onClick={onBack}><ArrowLeft size={24} /></button>
                    <h1 className="text-xl font-bold ml-4">Ghi chú</h1>
                </div>
                <button onClick={handleNewNote} className="p-1 rounded-full hover:bg-pink-200">
                    <Plus size={24} />
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {notes.map(note => (
                    <div 
                        key={note.id} 
                        onClick={() => handleSelectNote(note)}
                        className="bg-[#FBCFE8] p-4 rounded-xl shadow-sm cursor-pointer hover:brightness-95 transition"
                    >
                        <h3 className="font-bold text-base text-pink-900 line-clamp-2 break-words">{note.title || "Ghi chú không có tiêu đề"}</h3>
                        <p className="text-sm text-pink-800 line-clamp-3 break-words mt-1">{note.content}</p>
                    </div>
                ))}
            </div>
            
            {editingNote && (
                <NoteEditor
                    note={editingNote}
                    onBack={() => setEditingNote(null)}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                />
            )}
            <style>{`
                @keyframes slide-in-right { 
                    from { transform: translateX(100%); } 
                    to { transform: translateX(0); } 
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default NotesApp;
