import React from 'react'
import { useEffect } from 'react';

// ModelAvatar.jsx
export function ModelAvatar({ model }) {
    return (
        <div className="relative">
            <img
                src={model?.profile_image || "-avatar.png"}
                alt={model?.name || "AI Model"}
                className="w-12 h-12 rounded-full border-2 border-zinc-700"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
        </div>
    );
}

// CommandPalette.jsx

export function CommandPalette({ open, onClose, commands }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-zinc-800 rounded-xl w-full max-w-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Command Palette</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        ✕
                    </button>
                </div>
                <div className="space-y-2">
                    {commands.map((cmd) => (
                        <button
                            key={cmd.label}
                            onClick={cmd.action}
                            className="w-full text-left p-2 rounded-lg hover:bg-zinc-700"
                        >
                            {cmd.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// CitationPopup.jsx
export function CitationPopup({ source, content }) {
    return (
        <div className="relative group">
            <span className="text-blue-400 cursor-help border-b border-dashed border-blue-400">[source]</span>
            <div className="hidden group-hover:block absolute bottom-full left-0 bg-zinc-800 p-3 rounded-lg w-64 shadow-xl z-10">
                <h4 className="font-semibold mb-2">{source}</h4>
                <p className="text-sm text-zinc-300">{content}</p>
            </div>
        </div>
    );
}

// AttachmentPreview.jsx
export function AttachmentPreview({ files, onRemove }) {
    return (
        <div className="flex gap-2 mt-2">
            {files.map((file) => (
                <div key={file.id} className="relative group">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center">
                        {file.type === 'image' ? (
                            <img src={file.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                    </div>
                    <button
                        onClick={() => onRemove(file.id)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
