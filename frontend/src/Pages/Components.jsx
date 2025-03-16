import React from "react";
import { Link, useParams } from "react-router-dom";

export function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[92vh] text-center">
            <h1 className="text-4xl font-bold mb-4">🚀 Welcome to the Chat App</h1>
            <p className="text-lg text-zinc-400 mb-6">💬 Select a model and start chatting!</p>
            <Link to="/models" className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700">🔍 View Models</Link>
        </div>
    );
}

export function Models() {
    const [models, setModels] = React.useState([]);

    React.useEffect(() => {
        fetch("http://127.0.0.1:5000/models")
            .then((res) => res.json())
            .then((data) => setModels(data));
    }, []);

    return (
        <div className="p-6 min-h-[92vh]">
            <h2 className="text-2xl font-bold mb-4">🤖 Available Models</h2>
            {models.length === 0 ? (
                <p>⏳ Loading models...</p>
            ) : (
                <ul>
                    {models.map((model) => (
                        <li key={model} className="mb-2">
                            <Link to={`/profile/${model}`} className="text-blue-400 hover:underline">
                                🔹 {model}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
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
