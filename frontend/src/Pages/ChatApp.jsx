import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ModelAvatar, CommandPalette, AttachmentPreview } from "./ChatComponents"

const API_BASE_URL = "http://127.0.0.1:5000";

export default function ChatApp() {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedModelDets, setSelectedModelDets] = useState(null);
    const [profile, setProfile] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/profiles`)
            .then(res => setModels(res.data))
            .catch(err => console.error("Error fetching models:", err));
    }, []);

    useEffect(() => {
        if (selectedModel) {
            axios.get(`${API_BASE_URL}/profiles/${selectedModel.replace("/", "-")}`)
                .then(res => setProfile(res.data))
                .catch(err => console.error("Error fetching profile:", err));

            axios.get(`${API_BASE_URL}/history/load`, { params: { model_name: selectedModel } })
                .then(res => setChatHistory(res.data))
                .catch(err => console.error("Error fetching history:", err));
        }
    }, [selectedModel]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const sendMessage = async () => {
        if (!message.trim() || !selectedModel) return;

        const userMessage = { role: "user", content: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/chat`, {
                model_name: selectedModel,
                prompt: message
            });

            setChatHistory(prev => [...prev, {
                role: "assistant",
                content: response.data.response
            }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setChatHistory(prev => [...prev, {
                role: "system",
                content: "Failed to get response from the AI"
            }]);
        }
        setLoading(false);
    };

    const handleAttachment = (files) => {
        setAttachments(files.map(file => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            type: file.type.split('/')[0]
        })));
    };

    return (
        <div className="h-screen flex bg-zinc-900 text-white overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-zinc-800 p-4 z-50 flex items-center justify-between">
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 hover:bg-zinc-700 rounded-lg"
                >
                    ☰
                </button>
                {selectedModel && selectedModelDets && (
                    <div className="flex items-center gap-2">
                        <ModelAvatar model={selectedModelDets} small />
                        <span className="font-medium">{selectedModel}</span>
                    </div>
                )}
            </div>

            {/* Model List Sidebar */}
            <div className={`fixed md:relative md:flex md:w-80 h-full bg-zinc-800/80 border-r border-zinc-700 flex-col transform transition-transform duration-300 ease-in-out ${
                showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } z-40`}>
                <div className="p-4 border-b border-zinc-700">
                    <h1 className="text-xl font-bold mb-4">Available Models</h1>
                    <input
                        placeholder="Search models..."
                        className="w-full p-2 bg-zinc-900 rounded-lg"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {models.map(model => (
                        <button
                            key={model}
                            onClick={() => {
                                setSelectedModel(model?.name);
                                setSelectedModelDets(model);
                                setShowSidebar(false);
                            }}
                            className={`w-full text-left p-4 hover:bg-zinc-700 transition-colors ${
                                selectedModel === model ? 'bg-zinc-700' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <ModelAvatar model={model} />
                                <span className="font-medium">{model?.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col pt-16 md:pt-0">
                {/* Desktop Header */}
                {selectedModel && profile && (
                    <div className="hidden md:flex p-4 border-b border-zinc-700 items-center gap-4">
                        <ModelAvatar model={selectedModelDets} profile={profile} />
                        <div>
                            <h2 className="text-lg font-bold">{profile.name}</h2>
                            <p className="text-zinc-400 text-sm">
                                {profile.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-4 md:mt-0">
                    {chatHistory.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[90%] md:max-w-2xl p-4 rounded-lg ${
                                msg.role === 'user'
                                    ? 'bg-blue-600/20'
                                    : 'bg-zinc-800/50'
                            }`}
                            >
                                <div className="flex items-start gap-3">
                                    {msg.role !== 'user' && (
                                        <ModelAvatar model={selectedModelDets} small />
                                    )}
                                    <div className="flex-1">
                                        <div className="text-sm font-medium mb-2">
                                            {msg.role === 'user' ? 'You' : profile?.name}
                                        </div>
                                        <div className="prose prose-invert whitespace-pre-wrap break-words">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-700 bg-zinc-900/50 backdrop-blur-lg sticky bottom-0">
                    <div className="max-w-4xl mx-auto relative flex items-center gap-2">
                        <div className="flex gap-2">
                            <input
                                type="file"
                                onChange={(e) => handleAttachment(e.target.files)}
                                className="hidden"
                                id="file-upload"
                                multiple
                            />
                            <label
                                htmlFor="file-upload"
                                className="p-3 hover:bg-zinc-800 bg-zinc-800/50 rounded-lg cursor-pointer flex items-center justify-center"
                            >
                                📎
                            </label>
                        </div>

                        <div className="relative w-full">
                            <textarea
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder="Type your message..."
                                className="w-full p-4 pr-16 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-blue-500 resize-none max-h-40"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                className="absolute right-4 bottom-4 p-4 bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50 top-1/2 transform -translate-y-1/2 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
                                    </div>
                                ) : (
                                    <span className=" tracking-tighter leading-tight text-2xl">↑</span>
                                )}
                            </button>
                        </div>

                        <AttachmentPreview
                            files={attachments}
                            onRemove={(id) => setAttachments(prev => prev.filter(f => f.id !== id))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}