import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChatApp from "./Pages/ChatApp";
import {Home, Models, Profile} from "./Pages/Components";

export default function App() {
  return (
    <>
      <div className="min-h-screen bg-zinc-900 flex flex-col text-white">
        <nav className="p-4 h-[8vh] border-b border-zinc-700 flex justify-between">
          <Link to="/" className="text-xl font-bold">Chat App</Link>
          <div>
            <Link to="/models" className="mx-2 hover:underline">Models</Link>
            <Link to="/chat" className="mx-2 hover:underline">Chat</Link>
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