# 🎨 Luminary Art Gallery

A professional, full-stack Online Art Gallery Management System built as a Final Year Project.

## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14, React 18, Tailwind CSS |
| State Mgmt | Zustand                           |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose ODM             |
| Auth       | JSON Web Tokens (JWT)             |
| Styling    | Tailwind CSS, Framer Motion       |

## ✨ Features

### Public
- 🖼️ Beautiful gallery with advanced filtering (category, artist, price)
- 🔍 Full-text search across artworks
- 👨‍🎨 Artist profiles with portfolios
- 🛒 Shopping cart with persistent state
- 💳 Multi-step checkout
- ⭐ Artwork reviews and ratings

### Admin
- 📊 Dashboard with revenue stats
- 🖼️ Full artwork CRUD
- 👨‍🎨 Artist management
- 📦 Order management with status updates

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally

### Backend Setup
```bash
cd backend
npm install
# Create .env (see .env file)
npm run seed     # Load sample data
npm run dev      # Start on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env.local (see .env.local file)
npm run dev      # Start on port 3000
```

### Default Credentials
| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@artgallery.com     | Admin@123  |
| User  | john@example.com         | User@123   |

## 📁 Project Structure

```
artgallery/
├── backend/
│   ├── config/          # DB connection, seed data
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── server.js        # Entry point
└── frontend/
    ├── app/             # Next.js App Router pages
    │   ├── gallery/     # Gallery page
    │   ├── artists/     # Artists pages
    │   ├── artwork/     # Artwork detail
    │   ├── cart/        # Shopping cart
    │   ├── checkout/    # Checkout flow
    │   ├── auth/        # Login/Register
    │   └── admin/       # Admin dashboard
    ├── components/      # Reusable components
    └── lib/             # API client, Zustand stores
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET  /api/auth/me` — Current user

### Artworks
- `GET  /api/artworks` — List (with filters)
- `GET  /api/artworks/:id` — Single artwork
- `POST /api/artworks` — Create (Admin)
- `PUT  /api/artworks/:id` — Update (Admin)
- `DELETE /api/artworks/:id` — Delete (Admin)

### Artists, Orders, Categories, Reviews
See full API documentation in the Word document.
