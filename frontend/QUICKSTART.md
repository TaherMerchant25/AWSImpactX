# ASPERA Frontend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```powershell
cd frontend
npm install
```

### Step 2: Run Development Server

```powershell
npm run dev
```

### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

---

## 📁 Project Overview

This is the **ASPERA AI-Powered Due Diligence Platform** frontend, built with:

- ⚡ **Next.js 14** (App Router)
- 🎨 **Tailwind CSS**
- 📘 **TypeScript**
- 🧩 **shadcn/ui**
- 🎯 **Lucide Icons**

---

## 🎯 Available Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features and agents overview |
| `/dashboard` | Main dashboard with agent status and findings |

---

## 🛠️ Available Scripts

```powershell
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 📦 Key Components

### Landing Page Components
- **Navigation** - Responsive header with mobile menu
- **Hero** - Main hero section with CTA
- **Features** - 6 platform features grid
- **Agents Section** - 5 AI agents showcase

### Dashboard Components
- **Stats Overview** - 4 metric cards
- **Agent Status** - Real-time progress tracking
- **Findings List** - Analysis results with severity levels
- **Risk Heatmap** - Visualization (placeholder)

---

## 🎨 Customization

### Change Colors
Edit: `tailwind.config.ts` and `app/globals.css`

### Add New Pages
Create: `app/your-page/page.tsx`

### Add New Components  
Create: `components/YourComponent.tsx`

---

## 🔗 Backend Integration (Coming Soon)

Currently using **mock data**. To connect with AWS backend:

1. Create API client in `lib/api-client.ts`
2. Add environment variables in `.env.local`
3. Update components to fetch real data
4. Implement WebSocket for real-time updates

See `README.md` for detailed integration guide.

---

## 📚 Documentation

- Full setup guide: `README.md`
- Backend docs: `../docs/`
- Component examples: `/components/ui/`

---

## 🐛 Troubleshooting

**Port already in use?**
```powershell
# Use different port
npm run dev -- -p 3001
```

**Dependencies issue?**
```powershell
rm -rf node_modules package-lock.json
npm install
```

**Build errors?**
```powershell
npm run lint
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)
```powershell
npm install -g vercel
vercel
```

### Deploy to AWS Amplify
```powershell
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

See full deployment guide in `README.md`

---

## 📞 Next Steps

1. ✅ Run the development server
2. ⏳ Explore the landing page and dashboard
3. ⏳ Review component structure
4. ⏳ Connect to AWS backend APIs
5. ⏳ Deploy to production

---

**Happy coding! 🎉**
