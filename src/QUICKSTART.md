# ⚡ Quick Start Guide

Get Kaizen Center running locally in 5 minutes!

## 🚀 Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure Supabase - edit this file:
# /utils/supabase/info.ts (or .tsx)
export const projectId = 'YOUR_PROJECT_ID';
export const publicAnonKey = 'YOUR_ANON_KEY';

# 3. Run database migrations
# Go to Supabase Dashboard → SQL Editor
# Copy-paste and execute each file in /supabase/migrations/

# 4. Deploy backend functions
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
cd supabase/functions
supabase functions deploy make-server-4c493c62

# 5. Start development server
npm run dev
```

**Open:** http://localhost:5173/

---

## 📂 Key Files to Edit

### Configuration
- `/utils/supabase/info.ts` - Supabase credentials

### Pages
- `/pages/*/ui/*.tsx` - Page components
- `/App.tsx` - Root component with routing

### Styles
- `/styles/globals.css` - Global CSS
- Use Tailwind classes in components

### Backend
- `/supabase/functions/server/*-routes.ts` - API endpoints
- Deploy: `supabase functions deploy make-server-4c493c62`

---

## 📁 Project Structure (FSD)

```
app/        → Global setup (routing, providers, layout)
pages/      → Page components (one per route)
widgets/    → Large UI blocks (header, sidebar, navigation)
features/   → Business features (auth, video-player)
entities/   → Business entities (user, tutorial)
shared/     → Reusable code (UI components, utils)
components/ → shadcn/ui components
```

**Import Rules:**
- ✅ Higher → Lower: `pages → widgets → features → entities → shared`
- ❌ Lower ← Higher: Not allowed!
- ✅ Use public API: `import { X } from 'features/auth'` (via index.ts)

---

## 🛠️ Common Tasks

### Add a New Page

```bash
# 1. Create folder
mkdir -p pages/my-page/ui

# 2. Create component
# pages/my-page/ui/MyPage.tsx
export function MyPage() {
  return <div>My Page</div>;
}

# 3. Export
# pages/my-page/index.ts
export { MyPage } from './ui/MyPage';

# 4. Add route (app/routing/useRouter.tsx)
export type Route = '...' | 'my-page';

# 5. Add to App.tsx
case 'my-page':
  return <MyPage />;
```

### Add API Endpoint

```typescript
// Backend: supabase/functions/server/my-routes.ts
export default new Hono()
  .get('/', (c) => c.json({ data: 'hello' }));

// Frontend: entities/my-entity/api/myApi.ts
export async function getData() {
  const res = await fetch(`${BASE_URL}/my-endpoint`);
  return res.json();
}
```

### Style with Tailwind

```typescript
<div className="bg-primary text-white p-4 rounded-lg shadow hover:shadow-lg">
  Content
</div>
```

---

## 🔧 Useful Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm install package      # Add dependency

supabase login                              # Login to Supabase
supabase link --project-ref ID              # Link project
supabase functions deploy NAME              # Deploy function
supabase functions logs NAME --tail         # View logs
```

---

## 🐛 Quick Fixes

**App won't start?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Changes not showing?**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**API not working?**
- Check `/utils/supabase/info.ts` values
- Redeploy: `supabase functions deploy make-server-4c493c62`

---

## 📚 Full Documentation

- **Local Development:** `/docs/LOCAL_DEVELOPMENT.md` (detailed guide)
- **Supabase Setup:** `/docs/SUPABASE_SETUP.md`
- **Video Tutorials:** `/docs/VIDEO_TUTORIALS_SETUP.md`
- **Migrations:** `/supabase/migrations/README.md`
- **FSD Guidelines:** `/Guidelines.md`

---

## 🎯 Ready!

You're all set to develop! Check `/docs/LOCAL_DEVELOPMENT.md` for detailed workflows.

**Happy Coding! 🚀**
