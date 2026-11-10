# 💰 Expense Tracker — Full-Stack Portfolio Platform

live Demo :- https://expense-tracker-nu-nine-16.vercel.app/

[![Live Demo](https://img.shields.io/badge/Demo-Live_Website-success?style=for-the-badge&logo=vercel)](https://expense-tracker-anji0522.vercel.app)
[![API Status](https://img.shields.io/badge/API-Render_Hosted-blue?style=for-the-badge&logo=render)](https://expense-tracker-api-anji.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![GitHub](https://img.shields.io/badge/GitHub-Anji0522%2Fexpense--tracker-181717?style=for-the-badge&logo=github)](https://github.com/Anji0522/expense-tracker)

A modern, production-ready Full-Stack Personal Finance & Expense Tracker built with **React**, **Node.js**, **Express**, and **PostgreSQL (Neon)**.

---

## 🔗 Live Application Links

| Resource | Link | Description |
| :--- | :--- | :--- |
| 🚀 **Live Demo Website** | [https://expense-tracker-anji0522.vercel.app](https://expense-tracker-anji0522.vercel.app) | Production Frontend deployed on Vercel |
| ⚙️ **REST API Backend** | [https://expense-tracker-api-anji.onrender.com](https://expense-tracker-api-anji.onrender.com) | Node.js & Express REST API on Render |
| 🏥 **API Health Check** | [https://expense-tracker-api-anji.onrender.com/api/health](https://expense-tracker-api-anji.onrender.com/api/health) | Live PostgreSQL & server health status |
| 🗄️ **Database Console** | [https://console.neon.tech](https://console.neon.tech) | Hosted Serverless PostgreSQL on Neon |
| 💻 **GitHub Repository** | [https://github.com/Anji0522/expense-tracker](https://github.com/Anji0522/expense-tracker) | Complete source code repository |

---

## 🌟 Key Features

- 🔐 **Secure Authentication**: User registration, login with hashed passwords via `bcryptjs`, and stateless JWT tokens.
- 🛡️ **Multi-Tenant Data Isolation**: Every category, expense, and budget record is strictly isolated per authenticated user with row-level ownership validation.
- 📊 **Visual Analytics**: Interactive category donut charts, spending trajectory trendlines, and a 90-day activity heatmap powered by `Recharts`.
- 🎯 **Monthly Budgeting**: Set spending ceilings per category, monitor remaining balances, and receive color-coded threshold alerts.
- 🏷️ **Custom Categories**: Pre-seeded with 12 defaults upon signup, plus full support to create custom categories with custom hex colors.
- 🔍 **Filtering & Search**: Live debounced search by description, filter by category and date ranges, with paginated queries.
- 📄 **Reports & CSV Export**: Generate printable monthly statement summaries and download raw transaction data as CSV.
- 🌓 **Dark & Light Mode**: Seamless theme switching with high-contrast UI variables.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite | Fast, responsive UI library & bundling |
| **Styling** | Vanilla CSS3 | Custom fintech design system (no Tailwind) |
| **Charts** | Recharts | Financial visualizations & graphs |
| **Icons** | Lucide React | Clean, lightweight icon pack |
| **Navigation** | React Router v7 | Protected routes & client-side routing |
| **HTTP Client** | Axios | Request interceptors & bearer token injection |
| **Backend** | Node.js, Express.js | Scalable REST API with ES Modules |
| **Database** | PostgreSQL, Neon | Hosted relational database with pooled connections |
| **Security** | Helmet, CORS, Rate Limit | API hardening & attack mitigation |
| **Validation** | Zod | Runtime schema validation on requests |
| **Testing** | Jest, Supertest | Automated testing for API endpoints |
| **CI/CD** | GitHub Actions | Automated build & test pipeline |

---

## 📁 Project Structure

```text
expense-tracker/
├── client/                     # Frontend React (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios instance & domain API calls
│   │   ├── components/         # Layout, UI buttons, modals & charts
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── hooks/              # Custom hooks (useExpenses, useAnalytics, useDebounce)
│   │   ├── pages/              # Dashboard, Expenses, Budgets, Analytics, etc.
│   │   ├── routes/             # ProtectedRoute wrapper
│   │   ├── utils/              # formatCurrency, dates
│   │   ├── App.jsx             # Main router
│   │   ├── index.css           # Global stylesheet & design tokens
│   │   └── main.jsx
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/             # Database pool & environment variables
│   │   ├── controllers/        # Business logic for auth, expenses, budgets, etc.
│   │   ├── db/                 # schema.sql, seed.sql, check-connection.js
│   │   ├── middleware/         # auth (JWT), validation, errorHandler
│   │   ├── models/             # PostgreSQL database queries
│   │   ├── routes/             # REST route definitions
│   │   ├── utils/              # ApiError, generateToken, CSV exporter
│   │   ├── validators/         # Zod schemas
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # Server entry point
│   ├── tests/                  # Jest & Supertest test suites
│   ├── .env.example
│   └── package.json
├── .github/workflows/ci.yml     # Automated CI pipeline
├── docker-compose.yml          # Local PostgreSQL container configuration
└── README.md
```

---

## 🗄️ Database Schema

The database consists of 5 core tables with foreign key constraints, cascaded deletions, and performance indexing:

1. **`users`**: User profile, hashed password, and preferred currency (`INR`, `USD`, `EUR`, `GBP`).
2. **`default_categories`**: Master template list of 12 starter categories.
3. **`categories`**: User-owned categories (automatically cloned upon registration).
4. **`expenses`**: Individual expense entries with amount, date, description, and category linkage.
5. **`budgets`**: Monthly limits per category per user (`unique_user_category_month`).

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- A free [Neon](https://neon.tech/) PostgreSQL account (or local PostgreSQL)

### 2. Clone the Repository
```bash
git clone https://github.com/Anji0522/expense-tracker.git
cd expense-tracker
```

### 3. Database Initialization
1. In the Neon Console SQL Editor, execute `server/src/db/schema.sql`.
2. Next, execute `server/src/db/seed.sql` to populate default categories.

### 4. Configure Backend Environment
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your-neon-postgres-connection-string?sslmode=require"
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Install backend dependencies and run tests:
```bash
cd server
npm install
npm test
npm run dev
```

### 5. Configure Frontend Environment
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install frontend dependencies and start Vite:
```bash
cd ../client
npm install
npm run dev
```

Visit `http://localhost:5173` to start using the app!

---

## 📡 REST API Reference

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | API health check & DB status |
| `POST` | `/api/auth/register` | No | Register new user & seed categories |
| `POST` | `/api/auth/login` | No | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Yes | Get currently logged-in user profile |
| `PATCH`| `/api/auth/currency` | Yes | Update user currency preference |
| `GET` | `/api/categories` | Yes | List user categories with spending stats |
| `POST` | `/api/categories` | Yes | Create a custom category |
| `PUT` | `/api/categories/:id` | Yes | Update category name & color |
| `DELETE`| `/api/categories/:id`| Yes | Delete a category |
| `GET` | `/api/expenses` | Yes | Paginated expense search & filters |
| `POST` | `/api/expenses` | Yes | Create an expense |
| `PUT` | `/api/expenses/:id` | Yes | Update an expense |
| `DELETE`| `/api/expenses/:id`| Yes | Delete an expense |
| `GET` | `/api/budgets` | Yes | List monthly budgets & utilization |
| `POST` | `/api/budgets` | Yes | Set / update a category budget limit |
| `DELETE`| `/api/budgets/:id` | Yes | Remove a budget target |
| `GET` | `/api/analytics/summary` | Yes | Overall financial metrics & KPIs |
| `GET` | `/api/analytics/monthly-trend` | Yes | 6-month spending trajectory |
| `GET` | `/api/analytics/daily-heatmap` | Yes | 90-day spending activity heatmap |
| `GET` | `/api/reports/monthly` | Yes | Monthly accounting report |
| `GET` | `/api/reports/export.csv` | Yes | Download raw expense records as CSV |

---

## 🚢 Deployment

- **Backend**: Hosted on [Render](https://render.com/) with root directory `server`, build command `npm install`, and start command `npm start`.
- **Frontend**: Hosted on [Vercel](https://vercel.com/) with root directory `client`, build command `npm run build`, and `vercel.json` rewrites.
- **Database**: Hosted on [Neon](https://neon.tech/) PostgreSQL.

---

## 📄 License
This project is licensed under the ISC License.
