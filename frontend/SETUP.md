# ASPERA Frontend - Complete Setup Instructions

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Running the Application](#running-the-application)
6. [Understanding the Components](#understanding-the-components)
7. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** version 18.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for version control)
- A code editor (VS Code recommended)
- Windows PowerShell or Command Prompt

### Check Your Installation

```powershell
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## Installation

### Step 1: Navigate to Frontend Directory

```powershell
cd d:\Downloads\Code_Autonomous\AWS\frontend
```

### Step 2: Install Dependencies

This will install all required packages (may take 2-3 minutes):

```powershell
npm install
```

**What gets installed:**
- React & Next.js framework
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui components
- Lucide React icons
- And more... (see package.json)

### Step 3: Verify Installation

Check that `node_modules` folder was created:

```powershell
ls node_modules
```

---

## Project Structure

```
frontend/
│
├── app/                          # Next.js App Router (main app structure)
│   ├── layout.tsx               # Root layout (applies to all pages)
│   ├── page.tsx                 # Home page (route: /)
│   ├── globals.css              # Global CSS & Tailwind imports
│   └── dashboard/
│       └── page.tsx             # Dashboard page (route: /dashboard)
│
├── components/                   # Reusable React components
│   └── ui/                      # UI primitives (shadcn/ui convention)
│       ├── button.tsx           # Button component
│       ├── saas-template.tsx    # Original template (reference)
│       └── aspera-landing.tsx   # ASPERA landing page component
│
├── lib/                         # Utility functions
│   └── utils.ts                 # Helper functions (cn for classnames)
│
├── public/                      # Static assets (images, fonts, etc.)
│
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── next.config.js               # Next.js configuration
├── .gitignore                   # Git ignore rules
├── README.md                    # Full documentation
└── QUICKSTART.md                # This file
```

---

## Technology Stack

### Core Framework
- **Next.js 14** - React framework with App Router
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - File-based routing

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
  - Dark mode support
  - Responsive design utilities
  - Custom color palette
  - Animation utilities

### Type Safety
- **TypeScript 5.3** - Static typing for JavaScript
  - Better IDE support
  - Catch errors before runtime
  - Improved code documentation

### UI Components
- **shadcn/ui** - Accessible, customizable components
  - Built on Radix UI primitives
  - Tailwind CSS styled
  - Copy-paste architecture

### Icons
- **Lucide React** - Beautiful, consistent icon set
  - 1000+ icons
  - Tree-shakeable
  - Customizable size and color

---

## Running the Application

### Development Mode (with Hot Reload)

```powershell
npm run dev
```

**What happens:**
1. Starts Next.js development server
2. Compiles TypeScript
3. Processes Tailwind CSS
4. Watches for file changes
5. Opens on http://localhost:3000

**Console output should show:**
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Open in Browser

Navigate to: **http://localhost:3000**

You should see:
- ✅ ASPERA landing page
- ✅ Navigation bar
- ✅ Hero section
- ✅ Features grid
- ✅ Agents section

### View Dashboard

Navigate to: **http://localhost:3000/dashboard**

You should see:
- ✅ Stats overview
- ✅ Agent status panel
- ✅ Recent findings
- ✅ Risk heatmap placeholder

### Production Build

```powershell
# Build for production
npm run build

# Start production server
npm start
```

---

## Understanding the Components

### 1. Landing Page (`/`)

**File:** `app/page.tsx` → imports `components/ui/aspera-landing.tsx`

**Structure:**
```
Landing Page
├── Navigation (sticky header)
│   ├── Logo (ASPERA)
│   ├── Nav Links (Features, Agents, Architecture, Docs)
│   └── Action Buttons (Sign in, Dashboard)
│
├── Hero Section
│   ├── Announcement Badge
│   ├── Main Heading
│   ├── Description
│   ├── CTA Buttons
│   └── Hero Image
│
├── Features Section
│   └── 6 Feature Cards
│       ├── Intelligent Document Processing
│       ├── Semantic Knowledge Graph
│       ├── Multi-Agent Analysis
│       ├── Financial Modeling
│       ├── Risk Heatmap
│       └── MCP Hub Integration
│
└── Agents Section
    └── 5 Agent Cards
        ├── Consistency Agent
        ├── Greenwashing Detector
        ├── Compliance Agent
        ├── Math Agent
        └── Risk Analysis Agent
```

### 2. Dashboard (`/dashboard`)

**File:** `app/dashboard/page.tsx`

**Structure:**
```
Dashboard
├── Header
│   ├── Back button
│   ├── Logo & title
│   └── Upload button
│
├── Stats Grid (4 cards)
│   ├── Documents Processed
│   ├── Critical Findings
│   ├── Active Agents
│   └── Avg Processing Time
│
├── Main Grid (2 columns)
│   ├── Agent Status Panel (left)
│   │   └── 5 agents with progress bars
│   │
│   └── Findings List (right)
│       └── Finding cards with severity
│
└── Risk Heatmap
    └── Placeholder for visualization
```

### 3. Reusable Components

#### Button (`components/ui/button.tsx`)

```typescript
import { Button } from "@/components/ui/button"

<Button variant="default">Click me</Button>
<Button variant="ghost" size="sm">Small ghost</Button>
<Button variant="outline" size="lg">Large outline</Button>
```

**Variants:**
- `default` - White background
- `secondary` - Gray background
- `ghost` - Transparent with hover
- `outline` - Border only
- `link` - Text link style

**Sizes:**
- `sm` - Small (height: 32px)
- `default` - Normal (height: 36px)
- `lg` - Large (height: 40px)
- `icon` - Square (36x36px)

---

## Understanding shadcn/ui

### What is shadcn/ui?

shadcn/ui is NOT a component library you install via npm. Instead:

1. **Copy-Paste Architecture** - You copy component code into your project
2. **Full Ownership** - Components become part of your codebase
3. **Customizable** - Modify any component as needed
4. **No Dependencies** - No need to update a package

### Why `/components/ui` folder?

This folder is **essential** because:

1. **Convention** - shadcn/ui expects this structure
2. **Organization** - Separates primitive UI from business logic
3. **Imports** - Makes imports consistent: `@/components/ui/button`
4. **Ecosystem** - Works with shadcn/ui CLI for adding components

### Adding More Components

While we created the button manually, you can add more:

```powershell
# Install shadcn/ui CLI
npx shadcn-ui@latest add dialog

# This creates: components/ui/dialog.tsx
```

**Available components:**
- accordion, alert, avatar, badge, card
- checkbox, dialog, dropdown-menu, input
- label, select, tabs, toast, tooltip
- And 40+ more...

**Browse all:** https://ui.shadcn.com/docs/components

---

## Tailwind CSS Basics

### What is Tailwind?

Utility-first CSS framework. Instead of writing CSS:

```css
/* Traditional CSS */
.button {
  background-color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
```

You use utility classes:

```tsx
<button className="bg-white px-4 py-2 rounded-md">
  Click me
</button>
```

### Common Utilities

```tsx
{/* Spacing */}
<div className="p-4">       {/* padding: 1rem */}
<div className="m-6">       {/* margin: 1.5rem */}
<div className="px-4 py-2"> {/* padding-x, padding-y */}

{/* Colors */}
<div className="bg-gray-900">  {/* background */}
<div className="text-white">   {/* text color */}
<div className="border-gray-800"> {/* border color */}

{/* Layout */}
<div className="flex items-center gap-4">
<div className="grid grid-cols-3">

{/* Responsive */}
<div className="text-sm md:text-base lg:text-lg">
{/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px */}
```

### Dark Mode

The project uses **class-based dark mode**:

```tsx
{/* In app/layout.tsx */}
<html className="dark">  {/* Applies dark theme */}

{/* In components */}
<div className="bg-white dark:bg-black">
```

---

## TypeScript Basics

### Why TypeScript?

1. **Type Safety** - Catch errors before runtime
2. **Better IDE Support** - Autocomplete, tooltips
3. **Documentation** - Types serve as documentation
4. **Refactoring** - Safer code changes

### Common Patterns

```typescript
// Interface for props
interface ButtonProps {
  variant?: "default" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
}

// Component with typed props
function Button({ variant = "default", children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

// Type for state
const [count, setCount] = useState<number>(0);

// Array of typed objects
const findings: Finding[] = [
  { id: "1", severity: "HIGH", title: "Issue" }
];
```

---

## Next Steps

### Immediate Next Steps

1. **Explore the Code**
   - Open `app/page.tsx` and modify the hero text
   - Change colors in `tailwind.config.ts`
   - Add a new feature card in `aspera-landing.tsx`

2. **Make It Your Own**
   - Replace "ASPERA" with your branding
   - Update the color scheme
   - Add your own images

3. **Add Functionality**
   - Create new pages
   - Add form inputs
   - Implement upload functionality

### Backend Integration

Currently, the frontend shows **mock data**. To connect to the AWS backend:

1. **Create API Client**
   ```typescript
   // lib/api-client.ts
   export async function fetchFindings() {
     const res = await fetch(`${API_URL}/findings`);
     return res.json();
   }
   ```

2. **Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=https://your-api.amazonaws.com
   ```

3. **Update Components**
   ```typescript
   // Instead of mock data
   const findings = [/* mock */];
   
   // Fetch real data
   const [findings, setFindings] = useState([]);
   useEffect(() => {
     fetchFindings().then(setFindings);
   }, []);
   ```

4. **Real-time Updates**
   - Implement WebSocket connection
   - Subscribe to agent status updates
   - Update UI in real-time

### Deployment

#### Option 1: Vercel (Easiest)

```powershell
npm install -g vercel
vercel
```

#### Option 2: AWS Amplify

```powershell
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

#### Option 3: Static Export

```powershell
# Add to next.config.js
output: 'export'

# Build
npm run build

# Deploy the 'out' folder to any static host
```

---

## Troubleshooting

### Port 3000 Already in Use

```powershell
# Use different port
npm run dev -- -p 3001
```

### Tailwind Classes Not Applying

1. Check `tailwind.config.ts` content paths
2. Ensure `globals.css` is imported in `layout.tsx`
3. Restart dev server

### TypeScript Errors

```powershell
# Check for errors
npm run lint

# Type check
npx tsc --noEmit
```

### Module Not Found

```powershell
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Build Fails

1. Check for TypeScript errors
2. Ensure all imports are correct
3. Verify all images have proper URLs

---

## Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### React
- [React Documentation](https://react.dev)
- [React Hooks](https://react.dev/reference/react)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Play](https://play.tailwindcss.com) (Online playground)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)

### shadcn/ui
- [Component Documentation](https://ui.shadcn.com)
- [Examples](https://ui.shadcn.com/examples)

---

## Support & Community

- **Next.js Discord:** https://discord.gg/nextjs
- **Tailwind Discord:** https://discord.gg/tailwindcss
- **GitHub Issues:** Create issues in your repository
- **Stack Overflow:** Tag questions with `next.js`, `tailwindcss`, `shadcn-ui`

---

## Summary

You now have a fully functional Next.js frontend for ASPERA with:

✅ Modern tech stack (Next.js, TypeScript, Tailwind, shadcn/ui)  
✅ Landing page with features and agents  
✅ Dashboard with agent status and findings  
✅ Dark mode theme  
✅ Responsive design  
✅ Ready for backend integration  
✅ Production-ready structure  

**Start the development server and start building! 🚀**

```powershell
npm run dev
```

Then open http://localhost:3000
