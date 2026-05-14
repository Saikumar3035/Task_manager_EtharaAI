# 🗂️ Team Task Manager

![Live](https://img.shields.io/badge/Live-Railway-brightgreen?style=flat-square&logo=railway)
![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Author](https://img.shields.io/badge/Author-Mudam%20Saikumar-orange?style=flat-square)

> A full-stack collaborative task management platform built with the **MERN Stack** — enabling teams to create projects, assign tasks, track progress, and collaborate in real time.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Authentication Flow](#-authentication-flow)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🚀 Overview

**Team Task Manager** is a role-based collaborative productivity platform where Admins and Members can:

- Manage projects and assign team members
- Create, assign, and track tasks with priorities and deadlines
- Monitor real-time activity logs and audit timelines
- Access a modern, responsive dashboard

Built for teams who need structure, clarity, and accountability — all in one place.

---

## 🌐 Live Demo

🔗 **[https://taskmanageretharaai-production-17b2.up.railway.app/](https://taskmanageretharaai-production-17b2.up.railway.app/)**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Security** | bcryptjs |
| **API Communication** | Axios |
| **State Management** | React Context API |
| **Styling** | CSS |

---

## ✨ Features

### 🔐 Authentication
- Admin & Member registration with role-based access
- Secure login with JWT token generation
- Password hashing via bcryptjs
- Persistent login session using `localStorage`

### 📁 Project Management
- Create and manage projects
- Assign team members per project
- Search and filter projects
- Visual project progress tracking

### ✅ Task Management
- Create and assign tasks to members
- Set priority levels and due dates
- Update task status (e.g., To Do → In Progress → Done)
- Track completion progress

### 📊 Activity Tracking
- Real-time activity logs
- Team collaboration timeline
- Audit history for every project

### 🎨 UI/UX
- Modern responsive dashboard
- Dynamic project cards
- Scrollable team member selection with checkbox UI
- Search and filter across projects/tasks

---

## 📂 Project Structure

```
team-task-manager/
│
├── backend/
│   ├── config/           # Database connection
│   ├── middleware/        # JWT authentication middleware
│   ├── models/           # Mongoose schemas (User, Project, Task)
│   ├── routes/           # Express API routes
│   ├── .env              # Environment variables
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context (Auth, Project, Task)
│   │   ├── pages/        # Page-level components
│   │   ├── styles/       # CSS stylesheets
│   │   └── App.jsx       # Root component
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

Ensure the following are installed:

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) | v18+ |
| [MongoDB](https://www.mongodb.com/try/download/community) | Latest |
| npm | Comes with Node.js |

Verify your installation:

```bash
node -v
npm -v
mongod --version
```

---

### Backend Setup

```bash
# Step 1: Navigate to the backend folder
cd backend

# Step 2: Install dependencies
npm install

# Step 3: Create a .env file (see Environment Variables section)

# Step 4: Start the backend server
node server.js
```

✅ **Expected output:**
```
MongoDB Connected
Server running on port 5000
```

---

### Frontend Setup

```bash
# Step 1: Navigate to the frontend folder
cd frontend

# Step 2: Install dependencies
npm install

# Step 3: Start the development server
npm run dev
```

✅ **Expected output:**
```
Local: http://localhost:5173
```

Open your browser and visit: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

Create a `.env` file inside the `/backend` folder with the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=Saikumar123
ADMIN_SECRET=SaikumarAdmin123
```

> ⚠️ **Important Notes:**
> - File name must be exactly `.env` — not `.env.txt`
> - No spaces around `=` signs
> - Restart the backend server after any changes to `.env`

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/signup` | `POST` | Register a new user (Admin or Member) |
| `/api/auth/login` | `POST` | Login and receive a JWT token |
| `/api/projects` | `GET` | Fetch all projects |
| `/api/projects` | `POST` | Create a new project |
| `/api/tasks` | `GET` | Fetch all tasks |
| `/api/tasks` | `POST` | Create a new task |

---

## 🔒 Authentication Flow

```
User submits login credentials
        ↓
Backend verifies email + password (bcrypt)
        ↓
JWT token generated (expires in 30 days)
        ↓
Token stored in localStorage
        ↓
All protected API routes validated via token
```

**Admin Registration** requires the Admin Secret Code:
```
SaikumarAdmin123
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| MongoDB not connecting | Run `mongod` in terminal to start the service |
| Port already in use | Change `PORT=5001` in `.env` |
| Invalid JWT token | Verify `JWT_SECRET` in `.env` and restart server |
| Logged out on refresh | Ensure `localStorage` logic is correctly implemented |
| Admin secret not working | Add `.trim()` when reading `process.env.ADMIN_SECRET` |

---

## 🚀 Future Enhancements

- [ ] 📧 Email notifications for task assignments
- [ ] 📎 File upload support for tasks
- [ ] 💬 Real-time in-app chat (WebSocket / Socket.io)
- [ ] 📅 Calendar integration for deadlines
- [ ] 🤖 AI-powered task suggestions
- [ ] 📱 Mobile app (React Native)

---

## ☁️ Deployment

| Layer | Recommended Platform |
|---|---|
| **Frontend** | [Vercel](https://vercel.com) / [Netlify](https://netlify.com) |
| **Backend** | [Render](https://render.com) / [Railway](https://railway.app) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) |

---

## 👨‍💻 Author

**Mudam Saikumar** — Frontend & Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-Saikumar3035-181717?style=flat-square&logo=github)](https://github.com/Saikumar3035)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-saikumarmudam-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/saikumarmudam)
[![Email](https://img.shields.io/badge/Email-saipatelmudam@gmail.com-D14836?style=flat-square&logo=gmail)](mailto:saipatelmudam@gmail.com)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using MongoDB · Express.js · React.js · Node.js
</p>
