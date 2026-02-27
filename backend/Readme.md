backend/README.md (copie-colle)
# Hospital MS — Backend (Node.js + Express + MongoDB)

Offline Hospital Management System API.
Manages: Patients, Doctors, Appointments, Invoices, Patient History.

---

## 1) Requirements
- Node.js (>= 18)
- MongoDB local running (MongoDB Community / Windows service / Compass)

---

## 2) Install
```bash
cd backend
npm install

If you don’t have a package.json with dependencies, install manually:

npm install express cors mongoose dotenv
3) Environment (.env)

Create a .env file inside backend/:

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_ms
4) Run
cd backend
node server.js

Expected:
✅ Server on http://localhost:4000

5) API Base URL

http://localhost:4000

6) Endpoints
A) Health Check

✅ GET /
Response:

{ "message": "Backend running ✅" }
B) Patients

✅ GET /patients
✅ POST /patients
✅ PUT /patients/:id
✅ DELETE /patients/:id

Example body (POST/PUT):

{
  "firstName": "Alice",
  "lastName": "Dupont",
  "phone": "690000000",
  "address": "Douala",
  "age": 24,
  "gender": "FEMALE"
}
C) Doctors

✅ GET /doctors
✅ POST /doctors
✅ PUT /doctors/:id
✅ DELETE /doctors/:id

Example body:

{
  "name": "Dr. Kenfack Verane",
  "specialisation": "General Medicine",
  "telephone": "699100001",
  "disponibilite": "Mon-Fri 08:00-16:00"
}
D) Appointments

✅ GET /appointments
✅ POST /appointments
✅ PUT /appointments/:id
✅ DELETE /appointments/:id

Example body:

{
  "patientId": "PATIENT_ID",
  "doctorId": "DOCTOR_ID",
  "date": "2026-02-22",
  "time": "10:30",
  "status": "PENDING",
  "reason": "Malaria consultation"
}

Status values:

PENDING | CONFIRMED | DONE | CANCELLED

E) Invoices (Billing)

✅ GET /invoices
✅ POST /invoices
✅ PUT /invoices/:id
✅ DELETE /invoices/:id
✅ GET /invoices/stats

Example body:

{
  "patientId": "PATIENT_ID",
  "services": "Consultation + Lab test",
  "amount": 12000,
  "status": "PAID",
  "invoiceDate": "2026-02-22"
}
F) Patient History

✅ GET /patients/:id/history

Returns patient + appointments + invoices:

{
  "patient": { "_id": "...", "firstName": "...", "age": 24, "gender": "MALE" },
  "appointments": [],
  "invoices": []
}
7) Common Errors

400 Bad Request: missing required fields
404 Not Found: patient/doctor not found
500 Server Error: database or server error

8) Quick Test (Bruno / Browser)

http://localhost:4000/patients

http://localhost:4000/doctors

http://localhost:4000/appointments

http://localhost:4000/invoices

http://localhost:4000/invoices/stats

http://localhost:4000/patients/:id/history

9) Project Structure (typical)

server.js

src/

config/db.js

models/

controllers/

routes/