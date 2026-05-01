# TaskFlow — Team Task Manager 
  
 A full-stack team task management application with role-based access control, Kanban boards, and real-time notifications. 
  
 ## 🔗 Live Demo 
 - Frontend: [YOUR_FRONTEND_URL] 
 - Backend API: [YOUR_BACKEND_URL] 
  
 ## 🚀 Features 
 - JWT Authentication (Register/Login) 
 - Role-based access (Admin/Member) 
 - Project management with team collaboration 
 - Kanban board with drag & drop 
 - Task assignment and status tracking 
 - Real-time notifications 
 - Dashboard with analytics 
 - Responsive dark UI 
  
 ## 🛠 Tech Stack 
 **Frontend:** React, Vite, TailwindCSS, Zustand, React Router v6, React Hook Form 
 **Backend:** Node.js, Express.js, JWT, bcrypt 
 **Database:** MongoDB Atlas, Mongoose 
 **Deployment:** Railway 
  
 ## 📦 Local Setup 
  
 ### Prerequisites 
 - Node.js 18+ 
 - MongoDB Atlas account 
  
 ### Installation 
  
 Clone the repo: 
 ```bash
 git clone https://github.com/YOUR_USERNAME/taskflow-app
 cd taskflow-app
 ```
  
 Install dependencies: 
 ```bash
 npm run install:all
 ```
  
 Create server/.env: 
 ```env
 PORT=5000 
 MONGO_URI=your_mongodb_uri 
 JWT_SECRET=your_secret_key 
 JWT_EXPIRE=7d 
 NODE_ENV=development 
 CLIENT_URL=http://localhost:5173 
 ```
  
 Create client/.env: 
 ```env
 VITE_API_URL=http://localhost:5000/api 
 ```
  
 Run development server: 
 ```bash
 npm run dev 
 ```
  
 ## 📁 Project Structure 
 taskflow/ 
 ├── client/          # React frontend 
 │   ├── src/ 
 │   │   ├── pages/ 
 │   │   ├── components/ 
 │   │   ├── store/ 
 │   │   ├── services/ 
 │   │   └── hooks/ 
 ├── server/          # Node.js backend 
 │   ├── controllers/ 
 │   ├── models/ 
 │   ├── routes/ 
 │   ├── middleware/ 
 │   └── utils/ 
 └── README.md 
  
 ## 🔐 API Endpoints 
  
 ### Auth 
 POST   /api/auth/register 
 POST   /api/auth/login 
 POST   /api/auth/logout 
 GET    /api/auth/me 
  
 ### Projects 
 GET    /api/projects 
 POST   /api/projects 
 GET    /api/projects/:id 
 PUT    /api/projects/:id 
 DELETE /api/projects/:id 
  
 ### Tasks 
 GET    /api/projects/:id/tasks 
 POST   /api/projects/:id/tasks 
 PUT    /api/tasks/:id 
 DELETE /api/tasks/:id 
 POST   /api/tasks/:id/comments 
  
 ### Users 
 GET    /api/users 
 GET    /api/users/notifications 
 PUT    /api/users/notifications/read-all 
  
 ## 👤 Demo Accounts 
 After registering, create an Admin account to access all features including project creation and member management. 
  
 --- 
 Built with ❤️ using React + Node.js + MongoDB 
