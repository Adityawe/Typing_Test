# Keystroke — Modern Typing Practice

A calm, minimalist typing test web application that helps you find your rhythm, build accuracy, and improve typing speed.

![Keystroke Preview](./Assets/icon.png)

## ✨ Features

- **3 Difficulty Levels**:
  - `Beginner`: Friendly vocabulary, simple sentences, gentle paragraphs, and clean integer numbers.
  - `Advanced`: Rich vocabulary, compound sentences, standard paragraphs, decimals, and percentages.
  - `Expert`: Complex words, intricate punctuation, dialogues, currencies, timestamps, and dates.
- **4 Practice Categories**:
  - `Words`: Real-time vocabulary streams.
  - `Sentences`: Authentic quotes and thoughts.
  - `Paragraphs`: Natural storytelling passages.
  - `Numbers`: Procedural numeric practice with mixed symbols.
- **Free Public APIs (Zero Setup / Keyless)**:
  - Quotes from [DummyJSON Quotes API](https://dummyjson.com/quotes/random)
  - Stories from [DummyJSON Posts API](https://dummyjson.com/posts)
  - Words from [Random Word API](https://random-word-api.herokuapp.com/word)
  - Built-in instant offline fallbacks so the app never fails even without an internet connection.
- **Live Performance Stats**: Real-time Words Per Minute (WPM), Accuracy percentage, and countdown timer.
- **Keyboard Shortcuts**:
  - <kbd>Esc</kbd> / `Restart`: Retry the current passage.
  - `New Text`: Fetch a brand-new passage from the API.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm / yarn

### Installation
```bash
git clone https://github.com/Adityawe/Typing_Test.git
cd Typing_Test
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
The output files will be in the `dist/` directory.

## 📄 License
MIT
