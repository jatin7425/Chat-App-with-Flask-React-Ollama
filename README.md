
# Chat App with Flask & React

This project is a chatbot application built with **Flask** (backend) and **React** (frontend). It supports multiple AI models, chat history management, and dynamic profile generation.

## 🚀 Features

* **Flask API** for AI chat models
* **React UI** with model selection & chat interface
* **Chat history management** per model
* **Dynamic model profiles** with avatars
* **Multi-character support** for AI models

---

## 📦 Installation Guide

### 1️⃣ **Requirements**

Before running the project, ensure you have the following installed:

* **Python 3.8+**
* **Node.js & npm**
* **Ollama** (Install from: [ollama.ai](https://ollama.ai/))

### 2️⃣ **Project Setup**

#### Install dependencies

```sh
npm i  # Install dependencies in the root folder (for concurrently package)
```

### 3️⃣ **Backend Setup (Flask API)**

#### Install dependencies

```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r req.txt
```

#### Run the Flask server

```sh
python app.py
```

The API will be available at: `http://127.0.0.1:5000`

---

### 4️⃣ **Frontend Setup (React UI)**

#### Install dependencies

```sh
cd frontend
npm install
```

#### Start the React app

```sh
npm run dev
```

The UI will be available at: `http://localhost:5173`

---

## 🔗 API Endpoints

### 📌 **Model Management**

* `GET /models` → Fetch list of available models
* `GET /profiles` → Get all model profiles
* `GET /profiles/<model_name>` → Get profile of a specific model

### 💬 **Chat Functionality**

* `POST /chat` → Send a message to a model
  * **Body:** `{ "model_name": "<model>", "prompt": "<message>" }`
  * **Response:** `{ "response": "AI's reply" }`
* `GET /history/load?model_name=<model>` → Fetch chat history for a model

---

## 📜 Project Structure

```
backend/
│── app.py          # Flask backend
│── data/           # Stores chat history & profiles
│   ├── chat_histories/   # Folder for chat history JSONs
│   ├── profile.json      # Stores model profiles
│── req.txt         # Backend dependencies
│── venv/           # Virtual environment

frontend/
│── node_modules/   # Installed dependencies
│── public/         # Static assets
│── src/            # Source code
│   ├── assets/     # Images & static files
│   ├── Pages/      # Page components
│   │   ├── ChatApp.jsx   # Chat UI component
│   │   ├── Components.jsx # UI Components
│   │   ├── App.jsx       # Main React entry
│   ├── index.css   # Global styles
│   ├── main.jsx    # React main entry
│── package.json    # Frontend dependencies
│── vite.config.js  # Vite configuration
│── index.html      # Main HTML file
│── .gitignore      # Git ignore file
│── eslint.config.js # Linting configuration
```

---

## 🎯 Usage

1. Install **Ollama** and dependencies.
2. Install dependencies in the root folder (`npm i`)
3. Start the Flask backend (`python app.py`)
4. Start the React frontend (`npm run dev`)
5. Open `http://localhost:5173` in your browser
6. Select a model and start chatting!

---

## 🛠️ Future Enhancements

* **User authentication** for personalized chats
* **Multiple AI model providers**
* **Voice interaction support**

🚀 **Happy Coding!**
