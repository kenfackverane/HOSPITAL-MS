# HOSPITAL-MS
Offline Hospital Management System (OHMS)

A full-stack offline hospital management application designed to manage patients, doctors, appointments, billing, and patient history without requiring an internet connection.

This system demonstrates how digital tools can improve hospital administration efficiency in environments with limited connectivity.

🎯 Project Purpose

Small clinics often rely on paper records, which can lead to:

data loss

slow access to information

human errors

inefficient workflows

OHMS provides a simple digital solution to manage hospital operations locally.

🧱 Technologies Used
Frontend

React (Vite)

CSS (custom styling)

Axios

Backend

Node.js

Express.js

MongoDB (local database)

Mongoose

⚙️ Key Features
👥 Patient Management

✔ Add patients
✔ Edit patients
✔ Delete patients
✔ View patient list

👨‍⚕️ Doctor Management

✔ Add doctors
✔ Edit doctors
✔ Delete doctors
✔ View availability

📅 Appointment Scheduling

✔ Create appointments
✔ Assign doctor & patient
✔ Track date & time
✔ Manage appointment status

💳 Billing System

✔ Generate invoices
✔ VAT support
✔ Multiple payment modes
✔ Track paid / unpaid
✔ Invoice stored in patient history

🧾 Patient History

✔ View patient details
✔ View appointments history
✔ View invoices history


📊 Dynamic Dashboard

✔ Real-time statistics
✔ Auto refresh data
✔ Live appointment overview

🧾 Export Invoice PDF

✔ Printable invoice format

💊 Pharmacy Module

✔ Add medicines
✔ Track stock
✔ Manage expiry

🔔 Notifications

✔ New invoice alerts
✔ System updates

📴 Offline Capability

The system runs entirely on:

✔ localhost
✔ MongoDB local database
✔ without internet connection

📂 Project Structure
hospital-ms/
│
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── App.jsx
🚀 Installation Guide
1️⃣ Clone Project
git clone <repository-url>
2️⃣ Backend Setup
cd backend
npm install
node server.js

Server runs at:

👉 http://localhost:4000

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs at:

👉 http://localhost:5173

4️⃣ MongoDB

Make sure MongoDB is running locally.

📊 Dashboard Auto Simulation

The dashboard updates automatically when:

✔ new patient added
✔ appointment created
✔ invoice generated

📡 API Overview

Base URL:

http://localhost:4000


