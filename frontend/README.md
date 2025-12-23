# ASPERA Frontend Setup Guide

## Overview

This frontend application provides a modern, responsive UI for the ASPERA AI-Powered Due Diligence Platform. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with dark mode
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles & Tailwind
│   └── dashboard/
│       └── page.tsx         # Dashboard page
├── components/
│   └── ui/
│       ├── button.tsx       # shadcn/ui Button component
│       ├── saas-template.tsx # Original SaaS template
│       └── aspera-landing.tsx # ASPERA-adapted landing page
├── lib/
│   └── utils.ts             # Utility functions (cn, etc.)
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── next.config.js           # Next.js configuration
```

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- **React 18.3.1** - UI library
- **Next.js 14.2.0** - React framework
- **TypeScript 5.3.3** - Type safety
- **Tailwind CSS 3.4.0** - Utility-first CSS
- **Radix UI** - Accessible components
- **Lucide React** - Icon library
- **Recharts** - Chart library (for future analytics)

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Component Structure

### 1. Landing Page (`/`)

**Location:** `app/page.tsx` → `components/ui/aspera-landing.tsx`

**Features:**
- Hero section with ASPERA branding
- Feature showcase (6 key platform features)
- AI Agents overview (5 specialized agents)
- Responsive navigation with mobile menu
- Dark theme optimized for professional look

**Key Sections:**
- Navigation bar with sign-in and dashboard links
- Hero with gradient text and call-to-action
- Features grid showcasing platform capabilities
- Agents section listing all AI agents with status

### 2. Dashboard (`/dashboard`)

**Location:** `app/dashboard/page.tsx`

**Features:**
- Real-time agent status monitoring
- Document processing statistics
- Findings list with severity levels
- Risk heatmap placeholder
- Upload functionality

**Components:**
- **Stats Overview:** 4 metric cards showing:
  - Documents processed
  - Critical findings
  - Active agents
  - Average processing time

- **Agent Status Panel:** Shows progress of all 5 agents:
  - Consistency Agent
  - Greenwashing Detector
  - Compliance Agent
  - Math Agent
  - Risk Analysis Agent

- **Findings List:** Displays findings with:
  - Severity levels (CRITICAL, HIGH, MEDIUM, LOW)
  - Category tags
  - Agent attribution
  - Confidence scores

### 3. UI Components

#### Button Component (`components/ui/button.tsx`)

Standard shadcn/ui button with variants:
- `default` - Primary white button
- `secondary` - Gray button
- `ghost` - Transparent hover effect
- `outline` - Outlined button
- `link` - Link-styled button

Sizes: `sm`, `default`, `lg`, `icon`

#### Original SaaS Template (`components/ui/saas-template.tsx`)

The unmodified template as provided, can be used as reference or for other pages.

## Styling & Theming

### Tailwind CSS Configuration

Located in `tailwind.config.ts`:

- **Dark Mode:** Enabled via class strategy
- **Custom Colors:** Using CSS variables for theming
- **Animations:** Custom animations for accordion, etc.
- **Responsive Breakpoints:** Standard Tailwind breakpoints

### Global Styles

Located in `app/globals.css`:

- CSS variables for light/dark themes
- Dark mode is default (applied via `className="dark"` in layout)
- Custom base styles for consistent look

### Color Palette

The dark theme uses:
- Background: `#0a0a0a` (nearly black)
- Foreground: `#fafafa` (off-white)
- Borders: Gray-800 variants
- Accents: Blue, green, red for status indicators

## Integration with Backend

### Current Status

The frontend is currently **disconnected** from the backend and displays **mock data**. 

### Integration Roadmap

To connect with the AWS backend:

#### 1. Create API Client

```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-gateway.amazonaws.com';

export async function uploadDocument(file: File) {
  // Upload to S3 via pre-signed URL
}

export async function getFindings(documentId: string) {
  // Fetch findings from API Gateway
}

export async function getAgentStatus() {
  // Poll agent status from Step Functions
}
```

#### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com
NEXT_PUBLIC_S3_BUCKET=aspera-documents
NEXT_PUBLIC_REGION=us-east-1
```

#### 3. WebSocket for Real-time Updates

```typescript
// lib/websocket.ts
// Connect to AWS IoT or API Gateway WebSocket
// Subscribe to agent status updates
```

#### 4. AWS Amplify Integration

For authentication and deployment:

```bash
npm install aws-amplify @aws-amplify/ui-react
```

Configure in `app/layout.tsx`:
```typescript
import { Amplify } from 'aws-amplify';
Amplify.configure({ /* your config */ });
```

### API Endpoints Needed

Based on the backend structure, you'll need:

1. **POST /documents/upload** - Upload document trigger
2. **GET /documents/{id}/findings** - Get analysis results
3. **GET /agents/status** - Get all agent statuses
4. **GET /documents/{id}/risk-heatmap** - Get risk visualization data
5. **WebSocket** - Real-time agent progress updates

## Deployment

### Option 1: AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 3: AWS S3 + CloudFront

```bash
# Build static export
npm run build

# Upload to S3
aws s3 sync out/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Component Development with shadcn/ui

### Why /components/ui Folder?

The `/components/ui` folder is **critical** for shadcn/ui because:

1. **Convention:** shadcn/ui CLI expects components in this location
2. **Organization:** Separates primitive UI components from business logic
3. **Reusability:** Makes components easy to find and import
4. **Consistency:** Follows the shadcn/ui ecosystem standards

### Adding New shadcn/ui Components

While we've manually created the button component, you can add more:

```bash
# Example: Add Dialog component
npx shadcn-ui@latest add dialog

# This will create: components/ui/dialog.tsx
```

Available components:
- accordion, alert, badge, card, checkbox
- dialog, dropdown-menu, input, label
- select, tabs, toast, tooltip
- And many more...

## Customization Guide

### Adding New Features

1. **New Page:**
   ```bash
   # Create app/your-page/page.tsx
   ```

2. **New Component:**
   ```bash
   # Create components/YourComponent.tsx
   ```

3. **Update Navigation:**
   Edit `components/ui/aspera-landing.tsx` to add nav links

### Modifying Colors

Edit `tailwind.config.ts` and `app/globals.css` to adjust the color scheme.

### Adding Charts/Analytics

Use Recharts (already installed):

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// Create chart component
```

## Troubleshooting

### Common Issues

1. **Module not found errors:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Tailwind classes not working:**
   - Check `tailwind.config.ts` content paths
   - Ensure `globals.css` is imported in `layout.tsx`

3. **Dark mode not applying:**
   - Verify `<html className="dark">` in `layout.tsx`

4. **TypeScript errors:**
   ```bash
   npm run lint
   ```

## Performance Optimization

### Image Optimization

Use Next.js Image component:
```typescript
import Image from 'next/image';

<Image 
  src="/path/to/image.jpg" 
  width={800} 
  height={600}
  alt="Description"
/>
```

### Code Splitting

Next.js automatically code-splits by route. For component-level splitting:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
});
```

### Bundle Analysis

```bash
npm install @next/bundle-analyzer
```

Add to `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run: `ANALYZE=true npm run build`

## Next Steps

1. ✅ Frontend structure created
2. ✅ Landing page implemented
3. ✅ Dashboard with mock data
4. ⏳ Connect to AWS backend APIs
5. ⏳ Implement real-time agent status
6. ⏳ Add document upload functionality
7. ⏳ Create risk heatmap visualization
8. ⏳ Add authentication with AWS Cognito
9. ⏳ Deploy to AWS Amplify

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- [Radix UI](https://www.radix-ui.com)

## Support

For questions or issues:
1. Check the [Next.js GitHub](https://github.com/vercel/next.js)
2. Review [shadcn/ui documentation](https://ui.shadcn.com)
3. Consult the AWS Amplify docs for deployment
