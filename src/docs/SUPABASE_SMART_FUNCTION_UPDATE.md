# 📝 Обновление функции smart-function

Добавь код для админ панели видео в свою существующую функцию!

---

## 🎯 Что делать:

### Шаг 1: Открой Supabase Editor

**Dashboard → Edge Functions → smart-function → Open Editor**

---

### Шаг 2: Добавь новые файлы

#### Файл 1: `tutorial-routes.ts`

**Нажми "Add File"** в Editor, назови `tutorial-routes.ts`, вставь:

```typescript
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const tutorialRouter = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

tutorialRouter.get('/', async (c) => {
  try {
    const userId = c.req.query('userId');
    if (!userId) return c.json({ error: 'userId is required' }, 400);

    const { data: tutorials, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*')
      .order('order_index', { ascending: true });

    if (tutorialsError) throw tutorialsError;

    const { data: progress, error: progressError } = await supabase
      .from('user_video_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    const tutorialsWithProgress = tutorials.map(tutorial => {
      const userProgress = progress?.find(p => p.tutorial_id === tutorial.id);
      return {
        ...tutorial,
        watched: userProgress?.watched || false,
        lastPosition: userProgress?.last_position || 0,
      };
    });

    return c.json(tutorialsWithProgress);
  } catch (error) {
    return c.json({ error: 'Failed to fetch tutorials' }, 500);
  }
});

tutorialRouter.get('/:id/video-url', async (c) => {
  try {
    const { data: tutorial } = await supabase
      .from('tutorials')
      .select('storage_path')
      .eq('id', c.req.param('id'))
      .single();

    if (!tutorial) return c.json({ error: 'Tutorial not found' }, 404);

    const { data: signedUrlData } = await supabase
      .storage
      .from('tutorials')
      .createSignedUrl(tutorial.storage_path, 3600);

    return c.json({ url: signedUrlData.signedUrl });
  } catch (error) {
    return c.json({ error: 'Failed to get video URL' }, 500);
  }
});

tutorialRouter.post('/progress', async (c) => {
  try {
    const { userId, tutorialId, position, watched } = await c.req.json();

    const { data: existing } = await supabase
      .from('user_video_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('tutorial_id', tutorialId)
      .single();

    if (existing) {
      await supabase
        .from('user_video_progress')
        .update({
          last_position: position,
          watched: watched || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_video_progress')
        .insert([{
          user_id: userId,
          tutorial_id: tutorialId,
          last_position: position,
          watched: watched || false,
        }]);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to update progress' }, 500);
  }
});

export default tutorialRouter;
```

---

#### Файл 2: `tutorial-admin-routes.ts`

**Нажми "Add File"**, назови `tutorial-admin-routes.ts`, вставь:

```typescript
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const adminRouter = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

adminRouter.get('/list', async (c) => {
  try {
    const { data: tutorials } = await supabase
      .from('tutorials')
      .select('*')
      .order('order_index', { ascending: true });

    return c.json(tutorials);
  } catch (error) {
    return c.json({ error: 'Failed to fetch tutorials' }, 500);
  }
});

adminRouter.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const duration = parseInt(formData.get('duration') as string);

    if (!videoFile || !title) {
      return c.json({ error: 'Missing video file or title' }, 400);
    }

    const timestamp = Date.now();
    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${timestamp}-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('tutorials')
      .upload(fileName, videoFile, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: lastTutorial } = await supabase
      .from('tutorials')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastTutorial?.order_index || 0) + 1;

    const { data: tutorial, error: dbError } = await supabase
      .from('tutorials')
      .insert([{
        title,
        description: description || null,
        duration,
        storage_path: uploadData.path,
        order_index: nextOrderIndex,
      }])
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from('tutorials').remove([uploadData.path]);
      throw dbError;
    }

    return c.json(tutorial);
  } catch (error) {
    return c.json({ error: 'Failed to upload video' }, 500);
  }
});

adminRouter.delete('/:id', async (c) => {
  try {
    const { data: tutorial } = await supabase
      .from('tutorials')
      .select('storage_path')
      .eq('id', c.req.param('id'))
      .single();

    if (!tutorial) return c.json({ error: 'Tutorial not found' }, 404);

    await supabase.storage.from('tutorials').remove([tutorial.storage_path]);
    await supabase.from('tutorials').delete().eq('id', c.req.param('id'));

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete tutorial' }, 500);
  }
});

export default adminRouter;
```

---

### Шаг 3: Обнови index.tsx

**Открой существующий `index.tsx`**

**В начало файла** (после импорта Hono) добавь:

```typescript
import tutorialRoutes from "./tutorial-routes.ts";
import tutorialAdminRoutes from "./tutorial-admin-routes.ts";
```

**Перед строкой `Deno.serve(app.fetch);`** добавь:

```typescript
// Tutorial routes
app.route("/smart-function/tutorials", tutorialRoutes);
app.route("/smart-function/tutorials/admin", tutorialAdminRoutes);
```

---

### Шаг 4: Deploy!

**Нажми "Deploy"** в Editor!

---

### Шаг 5: Проверка

```
https://aavqkdxlfulawhevutpn.supabase.co/functions/v1/smart-function/health
```

Должно показать `{"status":"ok"}` ✅

---

## 🎉 Готово!

Теперь админ панель будет работать! 🚀
