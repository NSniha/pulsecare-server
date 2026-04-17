# PulseCare Server — Blood Donation API (Node.js + Express + MongoDB)

This is the backend API for **PulseCare**, a blood donation platform where donors can create donation requests, volunteers can update request status, and admins can manage users and all requests.  
Authentication is handled using **JWT**, and data is stored in **MongoDB Atlas**.

---

## 🔗 Live Links
- **API Base URL:** (add after deploy)
- **Client Live Site:** (add after deploy)

---

## ✅ Key Features
- JWT-based authentication (register/login)
- Role-based access control: **donor / volunteer / admin**
- Donor management: block/unblock, promote role (admin only)
- Donation request lifecycle: **pending → inprogress → done/canceled**
- Public endpoints:
  - Donor search by blood group + district + upazila
  - Pending donation requests list
- Funding endpoints + Stripe Payment Intent API (ready for full integration)
- Admin/Volunteer stats endpoint

---

## 🧩 Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Password hashing (bcryptjs)
- CORS
- Stripe (Payment Intent)

---

## 📦 NPM Packages Used
- express
- cors
- dotenv
- mongoose
- jsonwebtoken
- bcryptjs
- stripe

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory using `.env.example` as a reference.

### `.env` example
```env
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_LONG_RANDOM_SECRET

STRIPE_SECRET_KEY=
