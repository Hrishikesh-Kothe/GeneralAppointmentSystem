# 🏥 General Appointment Booking System

A modern, clean appointment booking system built with the MERN stack, designed for easy appointment scheduling between members and service specialists.

## ✨ Features

### 👨‍💼 For Members
- **Simple Registration**: Quick account creation with email/password
- **Service Categories**: Browse specialists across 4 categories:
  - 🏥 Healthcare (doctors, nurses, counselors)
  - 💅 Personal Care (salon, spa, wellness)  
  - 📚 Education (tutors, advisors)
  - 🔧 Home Service (repairs, maintenance)
- **Easy Booking**: Select category → Choose specialist → Book time slot
- **Appointment Management**: View all your booked appointments

### 👩‍⚕️ For Specialists  
- **Professional Registration**: Register with specialization and category
- **Schedule Management**: Create available time slots easily
- **Booking Overview**: See all appointments with member details
- **Real-time Updates**: Instant notification when slots are booked

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation & Setup

1. **Clone & Navigate**
   ```bash
   cd appointment-system
   ```

2. **Install Dependencies**
   ```bash
   npm run install-all
   ```

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Configure Environment**
   - Backend `.env` is already configured for local MongoDB
   - Update `MONGODB_URI` in `/backend/.env` if needed

5. **Run the Application**
   ```bash
   npm run dev
   ```

6. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎯 How to Use

### First Time Setup
1. **Register as Specialist**: Create account with your specialization
2. **Create Time Slots**: Add available dates and times
3. **Register as Member**: Create a member account (use different email)
4. **Book Appointments**: Browse categories and book available slots
5. **View Schedules**: Check your appointments in both accounts

### User Flow
```
Member: Register → Browse Categories → Select Specialist → Book → View Appointments
Specialist: Register → Create Time Slots → Manage Schedule → View Bookings
```

## 🛠 Technical Stack

- **Frontend**: React 18, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: Simple email/password (production ready with hashing)
- **State Management**: React hooks
- **Styling**: Modern Tailwind v3 with HSL color system

## 📱 Mobile Responsive

Fully responsive design that works beautifully on:
- 📱 Mobile phones (375px+)
- 📟 Tablets (768px+) 
- 💻 Desktop (1024px+)

## 🎨 Design Features

- **Clean UI**: Modern, professional interface
- **Intuitive Navigation**: Simple back buttons and clear CTAs
- **Visual Feedback**: Toast notifications for all actions
- **Status Indicators**: Color-coded appointment status
- **Smooth Animations**: Hover effects and transitions

## 📝 Project Structure

```
appointment-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/ui/    # Reusable UI components  
│   │   ├── App.js           # Main application
│   │   └── index.css        # Tailwind styles
│   └── package.json
├── backend/                  # Express backend
│   ├── server.js            # API routes & MongoDB
│   ├── .env                 # Environment config
│   └── package.json
└── package.json             # Root package with scripts
```

## 🚀 Deployment Ready

The system is designed for easy deployment:
- Frontend: Deploy to Vercel, Netlify, or any static host
- Backend: Deploy to Heroku, Railway, or any Node.js host  
- Database: Use MongoDB Atlas for production

## 💡 Future Enhancements

- Email notifications for bookings
- Calendar integration (Google Calendar, Outlook)
- Payment processing for paid services
- Rating and review system
- Multi-language support
- Advanced search and filtering

## 📄 License

MIT License - Feel free to use this for your projects!

---

**Built with ❤️ for seamless appointment scheduling**