# Productivity Tracker

A full-stack MERN application to track daily work hours, monitor productivity, and generate detailed reports about consistency and performance.  
The system helps users log their active work sessions in real time and provides insights into how effectively they are managing their time.

---

## Features

- Real-time work hour tracking
- Daily/weekly/monthly reports
- Consistency insights and performance analytics
- User authentication and session management
- Dashboard to view productivity stats
- MERN stack: MongoDB, Express.js, React.js, Node.js

---

## Tech Stack

**Frontend**  
- React.js  
- Redux (for state management)  
- Tailwind CSS (or any UI framework you choose)

**Backend**  
- Node.js  
- Express.js  
- MongoDB (Mongoose for ORM)

---

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-username/productivity-tracker.git
cd productivity-tracker
Backend Setup
bash
Copy
Edit
cd backend
npm install
npm run dev
Backend will run on http://localhost:5000

Frontend Setup
bash
Copy
Edit
cd frontend
npm install
npm start
Frontend will run on http://localhost:3000

Usage
Start the backend (npm run dev inside /backend)

Start the frontend (npm start inside /frontend)

Sign up or log in to your account

Start your work session timer

End the session to save tracked hours

View reports and consistency analytics on your dashboard

Folder Structure
bash
Copy
Edit
productivity-tracker/
│
├── backend/             # Express + MongoDB backend
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── server.js        # Main backend entry
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # App pages
│   │   ├── redux/       # State management
│   │   └── App.js
│
└── README.md
Future Enhancements
Pomodoro timer integration

AI-based productivity suggestions

Team productivity tracking

Export reports (PDF/Excel)