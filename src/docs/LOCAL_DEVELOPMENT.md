# 💻 Local Development Guide

Complete guide to run and develop Kaizen Center locally.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **npm or yarn** (comes with Node.js)
- ✅ **Git** (for version control)
- ✅ **Code Editor** (VS Code recommended)
- ✅ **Supabase Account** (for backend)

Check versions:
```bash
node --version   # Should be v18 or higher
npm --version    # Should be 9+ or higher
```

---

## 🚀 Step 1: Install Dependencies

Open terminal in project root:

```bash
# Install all dependencies
npm install

# Or with yarn
yarn install
```

This will install:
- React, TypeScript
- TailwindCSS
- Shadcn UI components
- Telegram Mini Apps SDK
- And all other dependencies

---

## 🔧 Step 2: Configure Supabase

### 2.1 Update Supabase Credentials

Edit `/utils/supabase/info.ts` (or `.tsx` if you renamed it):

```typescript
// Replace with YOUR Supabase project values
export const projectId = 'YOUR_PROJECT_ID';
export const publicAnonKey = 'YOUR_ANON_PUBLIC_KEY';
```

**Where to find these:**
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Settings → API
- Copy "Project URL" (extract ID from it) and "anon public" key

### 2.2 Alternative: Use Environment Variables (Better)

Create `.env.local` file in project root:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Update `/utils/supabase/info.ts`:

```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'fallback';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback';
```

**Important:** Add to `.gitignore`:
```
.env.local
.env
```

---

## 🗄️ Step 3: Setup Database

### 3.1 Run Migrations

Go to **Supabase Dashboard → SQL Editor**

Execute each migration file in order:
1. `/supabase/migrations/001_initial_schema.sql`
2. `/supabase/migrations/002_add_user_id_to_test_history.sql`
3. `/supabase/migrations/003_enable_auth.sql`
4. `/supabase/migrations/004_video_tutorials.sql`

Copy-paste each file's content and click "RUN"

### 3.2 Create Admin User (Optional)

**Dashboard → Authentication → Users → Add User**
- Email: `admin@test.local`
- Password: `test123456`
- Auto Confirm: ✅ Yes

---

## 🚢 Step 4: Deploy Edge Functions

### 4.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 4.2 Login to Supabase

```bash
supabase login
```

Browser will open → Authorize

### 4.3 Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 4.4 Deploy Functions

```bash
cd supabase/functions
supabase functions deploy make-server-4c493c62
```

### 4.5 Set Secrets (if using OpenAI)

```bash
supabase secrets set OPENAI_API_KEY=sk-your_openai_key
```

---

## ▶️ Step 5: Run Development Server

### Start the App

```bash
# In project root
npm run dev

# Or with yarn
yarn dev
```

**Output:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
  ➜  press h + enter to show help
```

**Open browser:** http://localhost:5173/

---

## 🎯 Step 6: Test the App

### 6.1 Web Mode (Admin)

1. Open http://localhost:5173/
2. You'll see **Login Form** (since not in Telegram)
3. Login with admin credentials
4. You should see the dashboard

### 6.2 Telegram Mode (User)

**Option A: Use Telegram Web App Test Environment**

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Set Mini App URL: `/setmenubutton` → your ngrok/tunnel URL
3. Open bot in Telegram

**Option B: Use ngrok for testing**

```bash
# Install ngrok
npm install -g ngrok

# In one terminal - run dev server
npm run dev

# In another terminal - expose it
ngrok http 5173
```

Copy the `https://xxx.ngrok.io` URL and set it as your Telegram Mini App URL.

---

## 📁 Project Structure Overview

```
kaizen-center/
├── app/                    # Application layer (routing, providers, layout)
│   ├── layout/            # AppLayout, themes
│   ├── providers/         # AuthProvider, other providers
│   └── routing/           # Router logic
│
├── pages/                  # Page components (routes)
│   ├── ai-test/
│   ├── test-history/
│   ├── tutorials/
│   ├── profile/
│   └── ...
│
├── widgets/                # Large UI blocks (header, sidebar, navigation)
│   ├── header/
│   ├── sidebar/
│   ├── bottom-nav/
│   ├── tutorial-navigation/
│   └── ...
│
├── features/               # Business features
│   ├── auth/              # Authentication
│   ├── video-player/      # Video player
│   └── ...
│
├── entities/               # Business entities
│   ├── user/              # User entity
│   ├── tutorial/          # Tutorial entity
│   ├── ai-test/           # AI test entity
│   └── ...
│
├── shared/                 # Shared code
│   └── ui/                # Reusable UI components
│
├── components/             # UI components (shadcn/ui)
│   └── ui/
│
├── supabase/               # Backend
│   ├── functions/         # Edge Functions
│   │   └── server/        # Main server with routes
│   └── migrations/        # Database migrations
│
├── utils/                  # Utility functions
│   └── supabase/          # Supabase config
│
├── App.tsx                 # Root component
└── main.tsx                # Entry point
```

---

## 🛠️ How to Make Changes

### Follow FSD (Feature-Sliced Design) Architecture

**Rule 1: Respect Layer Hierarchy**

```
app → pages → widgets → features → entities → shared
```

✅ Higher layers CAN import from lower layers  
❌ Lower layers CANNOT import from higher layers

**Rule 2: Slices are Isolated**

Slices on the same layer cannot import from each other:

```typescript
// ❌ WRONG
// features/auth/ui/LoginForm.tsx
import { something } from '../../video-player';

// ✅ CORRECT - move shared code to lower layer
// shared/lib/validators.ts
export const validateEmail = ...;

// features/auth/ui/LoginForm.tsx
import { validateEmail } from '../../../shared/lib/validators';
```

**Rule 3: Use Public API (index.ts)**

Each slice must export through `index.ts`:

```typescript
// features/auth/index.ts
export { LoginForm } from './ui/LoginForm';
export { useAuth } from './model/useAuth';
export type { AuthUser } from './model/types';

// Other files import from public API:
import { LoginForm, useAuth } from '../../../features/auth';
```

---

## 📝 Common Development Tasks

### 1. Add a New Page

**Example: Create "Settings" page**

```bash
# Create folder structure
mkdir -p pages/settings/ui
```

**Create `/pages/settings/ui/SettingsPage.tsx`:**

```typescript
export function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1>Settings</h1>
      <p>Your settings here</p>
    </div>
  );
}
```

**Create `/pages/settings/index.ts`:**

```typescript
export { SettingsPage } from './ui/SettingsPage';
```

**Add route in `/app/routing/useRouter.tsx`:**

```typescript
export type Route = '...' | 'settings';

// In parseUrlToRoute:
if (segments[0] === 'settings') {
  return { route: 'settings' };
}

// In routeToUrl:
case 'settings':
  return '/settings';
```

**Add to App.tsx:**

```typescript
import { SettingsPage } from './pages/settings';

// In renderPage():
case 'settings':
  return <SettingsPage />;
```

**Add to Sidebar:**

```typescript
// widgets/sidebar/ui/AppSidebar.tsx
import { Settings } from 'lucide-react';

const menuItems = [
  // ... existing items
  {
    title: 'Настройки',
    url: 'settings' as Route,
    icon: Settings,
  },
];
```

---

### 2. Add a New API Endpoint

**Backend: Create new route**

**`/supabase/functions/server/settings-routes.ts`:**

```typescript
import { Hono } from "npm:hono";

const settingsRouter = new Hono();

settingsRouter.get('/', (c) => {
  return c.json({ theme: 'dark', language: 'ru' });
});

export default settingsRouter;
```

**Add to main server (`/supabase/functions/server/index.tsx`):**

```typescript
import settingsRoutes from "./settings-routes.ts";

app.route("/make-server-4c493c62/settings", settingsRoutes);
```

**Deploy:**

```bash
cd supabase/functions
supabase functions deploy make-server-4c493c62
```

**Frontend: Create API function**

**`/entities/settings/api/settingsApi.ts`:**

```typescript
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4c493c62/settings`;

export async function getSettings() {
  const response = await fetch(BASE_URL, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` },
  });
  
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
}
```

**Use in component:**

```typescript
import { getSettings } from '../../../entities/settings';

const [settings, setSettings] = useState(null);

useEffect(() => {
  getSettings().then(setSettings);
}, []);
```

---

### 3. Add a New Component

**Shared UI Component:**

```bash
# Use shadcn/ui CLI
npx shadcn@latest add card
npx shadcn@latest add button
```

**Custom Component:**

```typescript
// shared/ui/CustomCard/CustomCard.tsx
export function CustomCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4 shadow">
      {children}
    </div>
  );
}

// shared/ui/CustomCard/index.ts
export { CustomCard } from './CustomCard';

// Usage in any page/widget
import { CustomCard } from '../../../shared/ui/CustomCard';
```

---

### 4. Update Styles

**Global styles:** `/styles/globals.css`

```css
/* Add custom colors */
:root {
  --custom-color: #ff6b6b;
}

/* Add custom utility */
.my-custom-class {
  background: var(--custom-color);
}
```

**Component styles:** Use Tailwind classes

```typescript
<div className="bg-primary text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  Content
</div>
```

---

### 5. Debug Issues

**Check Console:**

Open browser DevTools (F12) → Console tab

**Check Network:**

DevTools → Network tab → filter by "Fetch/XHR"

**Check Supabase Logs:**

```bash
# Real-time logs
supabase functions logs make-server-4c493c62 --tail
```

**Or in Dashboard:**

Functions → make-server-4c493c62 → Logs

---

## 🔄 Development Workflow

### Typical Workflow:

```bash
# 1. Pull latest changes (if working with team)
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-new-feature

# 3. Make changes...
# Edit files following FSD architecture

# 4. Run dev server and test
npm run dev

# 5. Test in browser
# http://localhost:5173

# 6. If backend changes - redeploy functions
cd supabase/functions
supabase functions deploy make-server-4c493c62
cd ../..

# 7. Commit changes
git add .
git commit -m "feat: add new feature"

# 8. Push to remote
git push origin feature/my-new-feature

# 9. Create Pull Request on GitHub
```

---

## 🧪 Testing Checklist

Before committing:

- [ ] App runs without errors (`npm run dev`)
- [ ] No console errors in browser
- [ ] Auth works (login/logout)
- [ ] All pages load correctly
- [ ] API calls work (check Network tab)
- [ ] Responsive design works (test mobile view)
- [ ] Code follows FSD architecture
- [ ] No TypeScript errors (`npm run type-check` if configured)

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: "Supabase connection failed"

**Solution:**
- Check `/utils/supabase/info.ts` has correct values
- Check Supabase project is running (Dashboard)
- Check Edge Functions are deployed

---

### Issue: "Cannot read property of undefined"

**Solution:**
- Add optional chaining: `user?.name` instead of `user.name`
- Add null checks: `if (user) { ... }`
- Check data is loaded before rendering

---

### Issue: Changes not appearing

**Solution:**
```bash
# Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Or clear Vite cache:
rm -rf node_modules/.vite
npm run dev
```

---

### Issue: TypeScript errors

**Solution:**
```bash
# Make sure types are installed
npm install -D @types/react @types/react-dom

# Restart VS Code TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📦 Useful NPM Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Linting (if configured)
npm run lint             # Check code quality

# Type checking (if configured)
npm run type-check       # Check TypeScript types

# Install new package
npm install package-name
npm install -D package-name  # Dev dependency
```

---

## 🎨 Recommended VS Code Extensions

Install these for better DX:

- **ES7+ React/Redux Snippets** - Code snippets
- **Tailwind CSS IntelliSense** - Autocomplete Tailwind classes
- **Prettier** - Code formatting
- **ESLint** - Linting
- **Error Lens** - Inline errors
- **GitLens** - Git integration
- **Path Intellisense** - Auto-complete imports

---

## 📚 Additional Resources

- **FSD Documentation:** https://feature-sliced.design/
- **React Docs:** https://react.dev/
- **TailwindCSS:** https://tailwindcss.com/
- **Shadcn/ui:** https://ui.shadcn.com/
- **Supabase Docs:** https://supabase.com/docs
- **Telegram Mini Apps:** https://core.telegram.org/bots/webapps

---

## 🎉 You're Ready!

Now you can:
- ✅ Run the project locally
- ✅ Make changes following FSD
- ✅ Test in browser and Telegram
- ✅ Deploy backend updates
- ✅ Debug issues

**Happy Coding!** 🚀

Questions? Check existing code or FSD docs for examples!
