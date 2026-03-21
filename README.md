# 🏋️ GYM CRM - Premium Frontend

A premium, enterprise-grade React web dashboard for the Gym CRM backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend running at `localhost:8080`

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set backend URL (optional - defaults to localhost:8080)
# Create .env file:
echo "REACT_APP_API_URL=http://localhost:8080" > .env

# 3. Start development server
npm start

# App opens at http://localhost:3000
```

### Build for Production

```bash
npm run build
```

---

## 🎨 Features

### Design
- **Dark Premium Theme** — OLED-optimized black with electric indigo accents
- **Glassmorphism** effects on modals and overlays
- **3D Particle Canvas** on login page
- **Animated Counters** on dashboard stats
- **Skeleton Loading** — smooth shimmer placeholders
- **Staggered Animations** — every page loads with elegant enter transitions
- **Responsive Sidebar** — collapsible with icon-only mode

### Screens
| Screen | Features |
|--------|---------|
| Login | 3D particle animation, glassmorphism panel |
| Dashboard | Animated stats, revenue/member charts, quick actions, expiring alerts |
| Members | Full CRUD, search, status filter, member detail view |
| Trainers | Card grid, ratings, specializations |
| Payments | Summary cards, filter tabs (Recent/Expiring/Overdue), pagination |
| Attendance | Check-in/out with user search, today's records |
| Memberships | Plan cards with feature lists, assign modal |
| Gyms | Location cards, full CRUD |
| Profile | Role badge, account details |

### Security
- JWT stored in localStorage
- Auto token refresh via interceptor
- Protected routes — redirect to login if unauthenticated
- Role-based navigation (sidebar shows only relevant items per role)

---

## 🔌 Backend Integration

All API calls match your Spring Boot backend:

| Service | Base URL |
|---------|---------|
| Auth | `POST /gym/auth/login` |
| Members | `GET/POST/PUT/DELETE /gym/members/**` |
| Trainers | `GET/POST/PUT/DELETE /gym/trainers/**` |
| Payments | `GET/POST /gym/payments/**` |
| Attendance | `POST/GET /api/gyms/{gymId}/attendance/**` |
| Memberships | `GET/POST /gym/memberships/**` |
| Plans | `GET/POST/PUT/DELETE /gym/membership_plans/**` |
| Gyms | `GET/POST/PUT/DELETE /gym/gyms/**` |

### Change Backend URL
Edit `src/api/index.js` line 3:
```js
const BASE_URL = 'http://your-server:8080';
```
Or set environment variable:
```
REACT_APP_API_URL=http://your-server:8080
```

---

## 📁 Project Structure

```
src/
├── api/           # Axios + all API functions
├── context/       # AuthContext (JWT + user state)
├── components/
│   └── layout/    # Sidebar + Header layout
├── pages/
│   ├── auth/      # Login
│   ├── dashboard/ # Main dashboard
│   ├── members/   # Members list + detail
│   ├── trainers/  # Trainer cards
│   ├── payments/  # Payment management
│   ├── attendance/# Check-in/out
│   ├── memberships/ # Plans + assignment
│   ├── gyms/      # Gym locations
│   └── profile/   # User profile
├── styles/
│   └── globals.css # Complete design system
└── App.js          # Router + providers
```

---

## 🎭 User Roles

| Role | Access |
|------|--------|
| SUPER_USER | Everything + all gyms |
| ADMIN | Full gym management |
| MANAGER | Members, payments, attendance |
| RECEPTIONIST | Check-in, members, payments |
| TRAINER | Own profile, attendance |
| MEMBER | Dashboard, profile, payments |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **React Router v6** — Navigation
- **Axios** — HTTP client with JWT interceptors
- **Recharts** — Revenue & member charts
- **Lucide React** — Icons
- **React Hot Toast** — Notifications
- **Framer Motion** — Animations (optional)
- **Google Fonts** — Syne (display) + DM Sans (body)

---

## 💡 Customization

### Change Theme Colors
Edit `src/styles/globals.css` CSS variables:
```css
:root {
  --accent-primary: #6366f1;    /* Change brand color */
  --bg-primary: #080810;         /* Change background */
}
```

### Add 3D Animations (Spline)
```bash
npm install @splinetool/react-spline
```
Then replace canvas in `LoginPage.js` with a Spline scene URL.

---

Made with ❤️ for your Gym CRM project
