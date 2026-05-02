# Serverless Calculator (SOA)

A sleek, minimal, black-themed calculator built on a Service Oriented Architecture (SOA). The project completely decouples a vanilla JavaScript frontend from a Python-based Serverless backend, demonstrating core modern architecture principles.

## 🚀 Features

- **Decoupled Architecture:** The UI and the calculation engine are entirely separate.
- **Serverless Backend:** Powered by a pure Python WSGI application designed to run on Vercel's serverless infrastructure.
- **Strict Idempotency:** The backend is a stateless, pure function. It stores no memory of past calculations, making it safe for network retries and highly scalable.
- **Minimal Black UI:** A premium, gradient-free user interface featuring subtle micro-animations and a responsive design.
- **Easter Egg:** Type `1337` and hit `=` to reveal a hidden, fully playable retro Snake Game! 🐍

## 🛠️ Technology Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript
- **Backend:** Python 3 (WSGI `http.server` implementation)
- **Deployment Strategy:** Vercel (Zero-config Serverless Functions)

## 📦 Project Structure

```text
├── index.html          # Main calculator interface
├── style.css           # Minimal black theme styling
├── script.js           # Frontend logic and API fetching
├── api/
│   └── index.py        # Python Serverless Backend (WSGI App)
├── vercel.json         # Vercel configuration override
└── README.md
```

*(Note: Legacy files like `calculator.py` and `deploy_and_test.sh` were originally used for AWS LocalStack prototyping).*

## 🌐 How to Deploy (Vercel)

This project is optimized for zero-configuration deployment on Vercel.

1. Push this repository to your GitHub account.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **Add New... > Project**.
4. Import your GitHub repository.
5. Click **Deploy**.

Vercel will automatically serve `index.html` as the static homepage and configure `api/index.py` as your serverless API endpoint.


