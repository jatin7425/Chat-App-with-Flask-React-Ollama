import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChatApp from "./Pages/ChatApp";
import { Home, Models, Profile } from "./Pages/Components";

export default function App() {
  return (
    <>
      <div className="min-h-screen bg-zinc-900 flex flex-col text-white">
        <nav className="p-4 h-[8vh] border-b border-zinc-700 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">ChatAI</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </Link>
          <div className="flex gap-4">
            <Link to="/models" className="hover:text-blue-400 transition-colors">Models</Link>
            <Link to="/chat" className="px-3 py-1 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors">
              Start Chatting
            </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/models" element={<Models />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="/profile/:modelName" element={<Profile />} />
        </Routes>
      </div>
    </>
  );
}