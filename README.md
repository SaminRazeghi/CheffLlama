# 🧑‍🍳 Chef LLaMA – AI Cooking Assistant

Chef LLaMA is a warm and friendly AI assistant that helps you figure out what to cook using ingredients you already have. Powered by TogetherAI's Mixtral-8x7B model, Chef LLaMA guides you step-by-step through meal suggestions and full recipes.

## 📸 Screenshots

![Home Screen](https://github.com/SaminRazeghi/CheffLlama/raw/main/public/image/home.png)


---

## ✨ Features

- 👋 Friendly conversation starter: "What ingredients do you have?"
- 🧠 Context-aware memory: remembers recent chat history
- 🍽️ Meal type preferences: choose cuisine or style (e.g., spicy, healthy)
- 🥘 Smart suggestions: 3 meal options based on your ingredients and taste
- 📋 Two-step recipe flow:
  1. First shows **only** ingredients.
  2. Then walks through each step with "Ready for the next step?"
- 🛡️ API key hidden via `.env`
- ⚙️ Easily switch between variants (`server.js` and `server.together.js`) for testing response behavior

---

## 🚀 How to Run Locally

### 1. Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/chef-llama.git
cd chef-llama
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a `.env` File

Create a `.env` file in the root of the project:

```dotenv
TOGETHER_API_KEY=your_together_api_key_here
```


### 4. Run the Server

```bash
node server.together.js
```

Server runs on: [http://localhost:3000](http://localhost:3000)

---

## 🗂 File Overview

| File                | Purpose |
|---------------------|---------|
| `server.js`         | Default server setup for handling user chats |
| `server.together.js`| Alternate version with a slightly different recipe flow |
| `.env`              | API key storage (ignored by git) |
| `public/`           | Static files & frontend assets |
| `README.md`         | This file! |

---

## 🧠 AI Prompt Logic

Chef LLaMA strictly follows a structured logic:

- Greets and asks about ingredients
- Asks about meal preferences
- Suggests 3 numbered meals
- If a recipe is requested:
  - Step 1: Shows **only** ingredients
  - Step 2: Waits for confirmation, then guides step-by-step

This ensures a friendly, interactive, and non-overwhelming user experience.

---

## ✅ Coming Soon (Ideas)

- 🔍 Ingredient search UI
- ❤️ Save favorite recipes


---

## 🤝 Contributions

Open to PRs, issues, and ideas! Let's cook something amazing together.

---

## 📄 License

MIT — feel free to use and remix responsibly.
