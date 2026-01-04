# QuickChat

QuickChat is a real-time one-to-one chat application built with React, Node.js, Express, MongoDB and Socket.IO. It supports user authentication, live messaging, online/offline presence, persistent login and a responsive UI — suitable for demoing real-time features in interviews or prototypes.

## Features
- User signup and login (JWT-based)
- Real-time one-to-one chat (Socket.IO)
- Online / offline presence indicators
- Message delivery and receive notifications
- Upload and share images in chat
- Unfriend / remove friend feature
- Dashboard with user list and unseen message counts
- Persistent login across page refresh
- Responsive UI for desktop and mobile

## Tech stack
- Frontend: React (Vite), Tailwind CSS
- Backend: Node.js, Express
- Real-time: Socket.IO
- Database: MongoDB (Mongoose)
- File uploads: Cloudinary
- Auth: JSON Web Tokens (JWT)

## Installation & Setup

Prerequisites:
- Node.js (v16+)
- npm or yarn
- MongoDB cluster or connection string
- Cloudinary account (for image uploads)

Repository layout:
- server/ — Express + Socket.IO backend
- client/ — React + Vite frontend

1. Clone the repo
```bash
git clone <repo-url>
cd QuickChat-Full-Stack
```

2. Backend setup
```bash
cd server
npm install
# create a .env (see example below)
npm run server       # development with nodemon
# or
npm start            # production style
```

3. Frontend setup
```bash
cd client
npm install
# create a .env (see example below)
npm run dev          # start Vite dev server
npm run build        # production build
npm run preview      # preview production build locally
```

## Environment variables (example)

Backend (.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:5000
```

Important: Keep secrets out of source control. Use a secrets manager or environment settings in production.

## How to run the project locally (quick)
1. Start backend
   - cd server
   - npm install
   - add .env (see example)
   - npm run server
2. Start frontend
   - cd client
   - npm install
   - add .env (VITE_BACKEND_URL)
   - npm run dev
3. Open the client URL from Vite (usually http://localhost:5173) and register/login.

## Basic Folder Structure
```
QuickChat-Full-Stack/
├─ client/                 # React + Vite app
│  ├─ src/
│  ├─ public/
│  └─ package.json
├─ server/                 # Express + Socket.IO backend
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ lib/
│  └─ server.js
├─ README.md
```


## Future improvements
- Group chat support
- Typing indicators and read receipts per message
- Message search & pagination (load more)
- Rate limiting and improved security hardening
- End-to-end encryption for messages
- Improve tests / CI pipeline and Docker deployment

