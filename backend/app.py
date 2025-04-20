from flask import Flask, request, jsonify
import ollama
import json
import os
import random
import re
from openai import OpenAI
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_DIR = "data"
CHAT_HISTORY_DIR = os.path.join(DATA_DIR, "chat_histories")
PROFILE_FILE = os.path.join(DATA_DIR, "profile.json")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)

def get_chat_history_file(model_name):
    safe_model_name = model_name.replace("/", "_")
    return os.path.join(CHAT_HISTORY_DIR, f"chat_history_{safe_model_name}.json")

def clean_response(text):
    return re.sub(r"<\|im_\d+\|>", "", text)

def save_chat_history(model_name, messages):
    history_file = get_chat_history_file(model_name)
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=4)

def load_chat_history(model_name):
    history_file = get_chat_history_file(model_name)
    if not os.path.exists(history_file):
        return []
    with open(history_file, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_profiles():
    models_info = ollama.list()
    new_profiles = {}
    existing_profiles = {}
    
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, "r", encoding="utf-8") as f:
            existing_profiles = json.load(f)
    
    existing_model_names = set(existing_profiles.keys())
    current_model_names = set(model["model"] for model in models_info.get("models", []))
    
    # Remove profiles for models that no longer exist
    for model_name in list(existing_profiles.keys()):
        if model_name not in current_model_names:
            del existing_profiles[model_name]
    
    # Add new profiles for models that are not in the existing profile list
    for model in models_info.get("models", []):
        model_name = model["model"]
        if model_name not in existing_profiles:
            existing_profiles[model_name] = {
                "name": model_name,
                "profile_image": f"https://avatar.iran.liara.run/public/{random.randint(50, 70)}",
                "characters": [],  # Placeholder for character extraction
                "IsMultiCharacter": False
            }
    
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(existing_profiles, f, ensure_ascii=False, indent=4)

def update_model_characters(model_name):
    client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
    try:
        prompt = "Provide a json formate of all the characters you portray for the user in the exact format [{Character: <character>, desc: <character_description>},{Character: <character>, desc: <character_description>}]. Give a sentence for each character in desc part. Do not include any extra text, explanations, or formatting beyond the specified structure. If you cannot comply, respond only with 'NO'."
        history = load_chat_history(model_name)
        history.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model=model_name,
            messages=history
        )
        characters = response.choices[0].message.content.strip()

        if os.path.exists(PROFILE_FILE):
            with open(PROFILE_FILE, "r", encoding="utf-8") as f:
                profiles = json.load(f)
        else:
            profiles = {}

        # Handle case where model responds with NO
        if characters.upper() == "NO":
            profiles[model_name]["characters"] = []
        else:
            character_list = []
            try:
                for char in characters.split("},"):
                    char = char.replace("{", "").replace("}", "").strip()
                    parts = [p.strip() for p in char.split(",")]

                    if len(parts) < 2:  # Ensure we have both char and description
                        continue

                    char_name = parts[0].split(":")[1].strip().strip("'")
                    char_desc = parts[1].split(":")[1].strip().strip("'")

                    character_list.append({
                        "name": char_name,
                        "description": char_desc,
                        "profile_image": f"https://avatar.iran.liara.run/public/{random.randint(50, 70)}"
                    })
            except Exception as e:
                print(f"Error parsing characters for {model_name}: {e}")
                character_list = []

            profiles[model_name]["characters"] = character_list

        profiles[model_name]["IsMultiCharacter"] = len(profiles[model_name]["characters"]) > 1

        with open(PROFILE_FILE, "w", encoding="utf-8") as f:
            json.dump(profiles, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Error updating characters for {model_name}: {e}")

@app.route("/models", methods=["GET"])
def list_models():
    models_info = ollama.list()
    model_names = [model["model"] for model in models_info.get("models", [])]
    
    return jsonify(model_names)

@app.route("/profiles", methods=["GET"])
def get_profiles():
    if not os.path.exists(PROFILE_FILE):
        generate_profiles()

    with open(PROFILE_FILE, "r", encoding="utf-8") as f:
        raw_profiles = json.load(f)

    # Convert to list of {"name": ..., "profile_image": ...}
    profiles = [
        {
            "name": profile_data.get("name"),
            "profile_image": profile_data.get("profile_image"),
            "characters": profile_data.get("characters"),
            "IsMultiCharacter": profile_data.get("IsMultiCharacter")
        }
        for profile_data in raw_profiles.values()
    ]

    return jsonify(profiles)


@app.route("/profiles/<model_name>", methods=["GET"])
def get_profile_by_model(model_name):
    model_name = model_name.replace("-", "/")
    if not os.path.exists(PROFILE_FILE):
        generate_profiles()
    
    history_file = get_chat_history_file(model_name)
    with open(PROFILE_FILE, "r", encoding="utf-8") as f:
        profiles = json.load(f)
    
    if not os.path.exists(history_file) and not profiles.get(model_name, {}).get("IsMultiCharacter", False):
        update_model_characters(model_name)
    with open(PROFILE_FILE, "r", encoding="utf-8") as f:
        profiles = json.load(f)
    return jsonify(profiles.get(model_name, {"error": "Model not found"}))

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    model_name = data.get("model_name").replace("-", "/")
    user_input = data.get("prompt")
    
    if not model_name or not user_input:
        return jsonify({"error": "model_name and prompt are required"}), 400
    
    client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
    history = load_chat_history(model_name)
    history.append({"role": "user", "content": user_input})
    
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=history,
        )
        bot_response = response.choices[0].message.content  
        model_response = clean_response(bot_response)
        history.append({"role": "assistant", "content": model_response})
        save_chat_history(model_name, history)
        return jsonify({"response": bot_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/history/load", methods=["GET"])
def load_history():
    model_name = request.args.get("model_name")
    if not model_name:
        return jsonify({"error": "model_name is required"}), 400
    return jsonify(load_chat_history(model_name))

if __name__ == "__main__":
    generate_profiles()
    app.run(debug=True)
