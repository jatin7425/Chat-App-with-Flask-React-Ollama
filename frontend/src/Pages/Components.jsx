import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000";

export function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[92vh] text-center bg-gradient-to-b from-zinc-900 to-zinc-800">
            <div className="max-w-4xl px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Next-Gen AI Conversations
                    </h1>
                    <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                        Engage with cutting-edge AI models powered by deep learning. Explore diverse personalities and specialized knowledge domains.
                    </p>
                    <Link
                        to="/models"
                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:scale-105 transition-transform font-semibold"
                    >
                        Explore Models
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    {['Real-time Interaction', 'Multi-Model Support', 'Context Awareness'].map((feature, idx) => (
                        <motion.div
                            key={feature}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.2 }}
                            className="p-6 bg-zinc-800/50 rounded-xl backdrop-blur-sm hover:bg-zinc-800 transition-colors"
                        >
                            <div className="w-12 h-12 mb-4 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 mask mask-star-2" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{feature}</h3>
                            <p className="text-zinc-400 text-sm">Advanced natural language processing with contextual understanding</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function Models() {
    const [models, setModels] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        axios.get(`${API_BASE_URL}/profiles`)
            .then(res => {
                // Convert object to array of models
                const modelsArray = Object.values(res.data);
                setModels(modelsArray);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching models:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-6 min-h-[92vh] bg-gradient-to-b from-zinc-900 to-zinc-800">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">AI Character Hub</h2>

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-zinc-800/50 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {models.map((model) => (
                            <Link
                                key={model.name}
                                to={`/profile/${encodeURIComponent(model.name)}`}
                                className="group relative bg-zinc-800/50 rounded-xl p-6 hover:bg-zinc-800 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                        <img
                                            src={model.profile_image}
                                            alt={model.name}
                                            className="w-16 h-16 rounded-xl object-cover border-2 border-zinc-600"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold truncate">{model?.name.split(':')[0]}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {model.IsMultiCharacter && (
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">
                                                        Multi-Character
                                                    </span>
                                                )}
                                                <span className="text-xs text-zinc-400">
                                                    {model.characters?.length || 0} personas
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {model.IsMultiCharacter && model.characters?.length > 0 && (
                                        <div className="flex-1 space-y-2 mb-4">
                                            {model.characters.slice(0, 2).map((char, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-zinc-900/50 rounded-lg">
                                                    <img
                                                        src={char.profile_image}
                                                        alt={char.name}
                                                        className="w-8 h-8 rounded-full border border-zinc-600"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{char.name}</p>
                                                        <p className="text-xs text-zinc-400 line-clamp-1">{char.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {model.characters.length > 2 && (
                                                <div className="text-center text-zinc-400 text-sm">
                                                    +{model.characters.length - 2} more characters
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-zinc-700/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-400">Version: {model.name.split(':')[1]}</span>
                                            <span className="text-blue-400">Explore →</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function Profile() {
    const { modelName } = useParams();
    const [profile, setProfile] = React.useState(null);

    React.useEffect(() => {
        fetch(`http://127.0.0.1:5000/profiles/${modelName}`)
            .then((res) => res.json())
            .then((data) => setProfile(data));
    }, [modelName]);

    if (!profile) return <p>⏳ Loading profile...</p>;

    console.log(profile)

    return (
        <div className="p-6 min-h-[92vh]">
            <h2 className="text-2xl font-bold mb-4">{profile.name} 🏷️</h2>
            {profile?.IsMultiCharacter ? (
                <div>
                    <h3 className="text-lg font-bold">🎭 Characters:</h3>
                    <ul>
                        {profile.characters.map((char, index) => (
                            <li key={index} className="text-zinc-300 flex justify-center items-center w-max mb-4 mt-1">
                                <img src={char.profile_image} alt="" srcset="" className="w-12 h-12 rounded-full mr-2" />
                                <div>{char.name} - {char.description}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <img src={profile.profile_image} alt={profile.name} className="w-24 h-24 rounded-full mb-4" />
            )}
            <Link to="/chat" className="mt-4 px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700">💬 Start Chat</Link>
        </div>
    );
}
