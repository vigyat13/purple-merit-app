 💜 Purple Merit App

A full-stack web application designed to track and manage merits/tasks. Built with a React frontend and a Python Flask backend, using PostgreSQL for data persistence.

## 🚀 Live Demo
- **Frontend (Vercel):** [https://purple-merit-app.vercel.app](https://purple-merit-app.vercel.app)
- **Backend (Render):** [https://purple-merit-app.onrender.com](https://purple-merit-app.onrender.com)

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js (Vite):** Fast and modern UI library.
- **Tailwind CSS:** Utility-first styling.
- **Axios:** For API communication.
- **React Router:** For seamless page navigation.

### **Backend**
- **Python Flask:** Lightweight WSGI web application framework.
- **Flask-SQLAlchemy:** ORM for database interactions.
- **Flask-JWT-Extended:** Secure authentication using JSON Web Tokens.
- **PostgreSQL:** Production-grade relational database.

---

## ✨ Features
- **User Authentication:** Secure Signup and Login functionality.
- **Protected Routes:** Only authenticated users can access the dashboard.
- **Data Persistence:** User profiles and data are stored securely in a PostgreSQL database.
- **Responsive Design:** Works on desktop and mobile.

---

## ⚙️ Local Setup Instructions

If you want to run this project locally, follow these steps:

### **1. Clone the Repository**
```bash
git clone [https://github.com/vigyat13/purple-merit-app.git](https://github.com/vigyat13/purple-merit-app.git)
cd purple-merit-app
2. Backend SetupNavigate to the backend folder and install dependencies:Bashcd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend folder with:Code snippetDATABASE_URL=postgresql://[YOUR_DB_USER]:[YOUR_DB_PASSWORD]@localhost/purple_db
JWT_SECRET_KEY=your_super_secret_key
Run the server:Bashpython run.py
3. Frontend SetupNavigate to the frontend folder:Bashcd ../frontend
npm install
Run the frontend:Bashnpm run dev
📡 API EndpointsMethodEndpointDescriptionPOST/api/auth/signupRegister a new userPOST/api/auth/loginLogin and retrieve JWT TokenGET/api/user/profileGet current user details (Protected)👨‍💻 AuthorVigyat Singh