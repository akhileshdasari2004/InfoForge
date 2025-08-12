# 🧠 Data Alchemist Pro - AI-Powered Data Cleaner & Rule Builder

> An intelligent data processing platform that transforms messy CSV/XLSX files into clean, validated datasets with explainable AI. Built with Next.js, Gemini AI, and Redis task queues.

---

## 👨‍💻 **Developer**

**Akhilesh Dasari**
- [LinkedIn](https://www.linkedin.com/in/akhilesh-dasari-24aug/)
- [GitHub](https://github.com/akhileshdasari2004)

---

## 📦 **Project Overview**

Data Alchemist Pro is a full-stack application I developed to solve the common problem of messy, inconsistent data. It empowers users to:
- Upload client/worker/task datasets
- Validate data with 12+ rules and Google's Gemini AI
- Auto-correct issues via AI suggestions
- Manage validation tasks through Redis queues
- Export clean datasets + generated business rules

---

## 🛠 **Tech Stack**

| Layer        | Tech Used                                    |
|--------------|---------------------------------------------|
| Frontend     | Next.js 14, TypeScript, Tailwind CSS        |
| UI Libraries | Shadcn UI, Magic UI                         |
| Backend      | Node.js, API routes (Next.js), TypeScript   |
| AI Layer     | Google Gemini AI API                        |
| Caching/Queue| Redis with Task Queues                      |
| Database     | MongoDB with Mongoose                       |
| Auth         | NextAuth.js                                 |

---

## ⚙️ **Core Features**

### ✅ **1. Smart File Upload**
- Upload **CSV/XLSX** files for clients, workers, tasks
- Auto-detects headers, formats, and cleans up dirty inputs

### 🧠 **2. AI-Powered Validation**
- Validates 12+ data rules including:
  - Required fields
  - Duplicate IDs
  - JSON & array parsing
  - Range and reference checks
- Uses **Gemini AI** for:
  - Suggesting fixes
  - Interpreting anomalies
  - Rule generation via natural language

### 🔁 **3. AI Queuing with Redis**
- AI prompts are queued using Redis
- Prevents race conditions and redundant calls
- Automatically returns cached responses when matched

### 🧩 **4. Visual UI & Rule Builder**
- MagicUI-powered landing interface
- Shadcn UI for clean dashboards
- Real-time validation result UI with badges, color-coded errors

### 💾 **5. Export Functionality**
- Download **cleaned CSV** files
- Export `rules.json` for business logic reusability

---

## 🎮 **How to Use**

### 🔧 Prerequisites
- Node.js 18+
- Redis Server (or cloud Redis URL)
- MongoDB URI
- Gemini AI API Key

### 🖥️ Local Setup

```bash
# Clone the repository
git clone https://github.com/akhileshdasari2004/data-alchemist-pro.git
cd data-alchemist-pro

# Install dependencies
npm install

# Add your .env.local file
touch .env.local
```

#### 🧬 Sample `.env.local`

```env
MONGODB_URI=mongodb://localhost:27017/data-alchemist
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key-here
REDIS_USERNAME=default
REDIS_HOST=your-redis-host
REDIS_PORT=your-port
REDIS_PASSWORD=your-password
```

### 🚀 Running the App

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

---

## 🔍 **Implementation Details**

### AI Integration
I implemented a robust AI service that leverages Google's Gemini API to analyze data patterns, suggest corrections, and generate validation rules. The system uses an in-memory job queue in development and Redis in production for reliable job processing.

### Data Validation Pipeline
The application follows a multi-stage validation process:
1. Schema validation (required fields, types)
2. Business rule validation (custom logic)
3. AI-powered enhancement and correction
4. Final validation and export

### Authentication & Security
Implemented NextAuth.js for secure user authentication with proper session management and environment-based security controls.

---

## 📝 **Future Enhancements**

- Add support for more file formats (JSON, XML)
- Implement collaborative team features
- Create a rule marketplace for sharing validation rules
- Add more AI-powered data visualization options

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

