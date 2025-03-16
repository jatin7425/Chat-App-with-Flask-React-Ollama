import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function ChatApp() {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [profile, setProfile] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [multiCharOpen, setMultiCharOpen] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/models`)
            .then((res) => setModels(res.data))
            .catch((err) => console.error("Error fetching models:", err));
    }, []);

    const selectModel = async (model) => {
        setSelectedModel(model);
        setModelsLoading(true);

        try {
            const profileRes = await axios.get(`${API_BASE_URL}/profiles/${model}`);
            setProfile(profileRes.data);
        } catch (err) {
            console.error("Error fetching profile:", err);
        }

        try {
            const historyRes = await axios.get(`${API_BASE_URL}/history/load`, { params: { model_name: model } });
            setChatHistory(historyRes.data);
        } catch (err) {
            console.error("Error fetching chat history:", err);
        }

        setModelsLoading(false);
    };

    const sendMessage = () => {
        if (!message.trim()) return;

        setLoading(true);
        const newMessage = { role: "user", content: message };
        setChatHistory((prev) => [...prev, newMessage]);

        // Show "Typing..." message
        setChatHistory((prev) => [...prev, { role: "assistant", content: "Typing..." }]);
        setMessage("");

        axios.post(`${API_BASE_URL}/chat`, { model_name: selectedModel, prompt: message })
            .then((res) => {
                const botResponse = { role: "assistant", content: res.data.response };
                setChatHistory((prev) => {
                    const updatedChat = [...prev];
                    updatedChat.pop(); // Remove "Typing..." message
                    return [...updatedChat, botResponse];
                });
            })
            .finally(() => setLoading(false));
    };


    const formatMessage = (text) => text.split("\n").map((line, index) => (
        <React.Fragment key={index}>{line}<br /></React.Fragment>
    ));
    const renderMessage = (msg) => {
        const parts = msg.content.split(/(```[\s\S]*?```)/g); // Split message into normal text and code blocks

        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                const codeContent = part.slice(3, -3).trim(); // Remove triple backticks

                return (
                    <div key={index} className="relative bg-zinc-900 p-3 rounded-md font-mono my-2">
                        <div className="sticky top-2 w-full flex justify-end">
                            <button
                                className="right-2 mr-full bg-gray-800 text-white p-1 rounded"
                                onClick={(e) => {
                                    navigator.clipboard.writeText(codeContent);
                                    e.target.innerText = "Copied!"; // Change button text
                                    setTimeout(() => {
                                        e.target.innerText = "Copy"; // Reset after 2 seconds
                                    }, 2000);
                                }}
                            >
                                Copy
                            </button>
                        </div>
                        <pre className="overflow-x-auto text-white">
                            <code>{codeContent}</code>
                        </pre>
                    </div>
                );
            }

            // Process normal text with line breaks and *italic* formatting
            return part.split("\n").map((line, i) => {
                const styledLine = line.split(/(\*[^*]+\*)/g).map((chunk, j) => {
                    if (chunk.startsWith("*") && chunk.endsWith("*")) {
                        return (
                            <span key={`${index}-${i}-${j}`} className="text-zinc-400">
                                {chunk.slice(1, -1)}
                            </span>
                        );
                    }
                    return chunk;
                });

                return (
                    <React.Fragment key={`${index}-${i}`}>
                        {styledLine}
                        <br />
                    </React.Fragment>
                );
            });
        });
    };




    return (
        <div className="flex h-[92vh] bg-zinc-900 text-white relative">
            {/* Sidebar */}
            <div className="max-w-1/4 h-full overflow-y-auto border-r border-zinc-700 bg-zinc-900 min-w-max">
                <h2 className="text-lg font-bold mb-2 max-sm:hidden">Available Models</h2>
                {models.map((model) => (
                    <button
                        key={model}
                        onClick={() => selectModel(model)}
                        className="block w-full text-left p-2 rounded-md hover:bg-zinc-700 whitespace-nowrap"
                    >
                        <img
                            src={profile?.profile_image || "/default-avatar.png"}
                            alt={profile?.name || "Model"}
                            className="w-10 h-10 rounded-full inline-block mr-3"
                        />
                        <span className={`${openSidebar ? "" : "max-sm:hidden"}`}>{model}</span>
                    </button>
                ))}
            </div>

            {/* Chat Section */}
            {modelsLoading ? (
                <div className="w-full flex items-center justify-center">Loading...</div>
            ) : (
                <div className="flex flex-col w-full p-4">
                    {selectedModel && profile ? (
                        <>
                            <div className="flex items-center mb-4 cursor-pointer" onClick={() => setMultiCharOpen(!multiCharOpen)}>
                                <img
                                    src={profile?.profile_image || "/default-avatar.png"}
                                    alt={profile?.name || "Model"}
                                    className="w-12 h-12 rounded-full mr-3"
                                />
                                <h2 className="text-lg font-bold whitespace-nowrap">{profile?.name}</h2>
                            </div>

                            {multiCharOpen && profile?.IsMultiCharacter && (
                                <p className="mb-2 text-sm">
                                    Characters:
                                    {profile?.characters.map((c, index) => (
                                        <span key={index} className="block m-1">
                                            {c.name} - ({c.description})
                                        </span>
                                    ))}
                                </p>
                            )}

                            <div className="flex-1 overflow-y-auto border border-zinc-700 rounded-md p-3 mb-3">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                        <span className="inline-block px-3 py-1 mb-2">
                                            {msg.role !== "user" && (
                                                <img
                                                    src={profile?.profile_image || "/default-avatar.png"}
                                                    alt={profile?.name || "Model"}
                                                    className="w-4 h-4 rounded-full inline-block mr-3"
                                                />
                                            )}
                                            {msg.role === "user" ? "You" : profile?.name}
                                        </span><br />
                                        <span className={`inline-block px-3 py-2 rounded-md ${msg.role === "user" ? "bg-zinc-700" : "bg-zinc-800"} sm:max-w-3/4 max-w-full`}>
                                            {renderMessage(msg)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center">
                                <textarea
                                    className="w-full p-2 bg-zinc-800 rounded-md focus:outline-none resize-none"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        e.target.rows = 1; // Reset rows before recalculating
                                        const lines = e.target.value.split("\n").length;
                                        e.target.rows = Math.min(2, Math.max(1, lines));
                                    }}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.shiftKey && e.key === "Enter") {
                                            e.preventDefault(); // Prevents newline
                                            sendMessage(); // Calls your submit function
                                        }
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={loading}
                                    className="ml-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    {loading ? "..." : "Send"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-zinc-400">Select a model to start chatting</p>
                    )}
                </div>
            )}
        </div>
    );
}
