# 📦 Готовые файлы для Supabase Editor

Скопируй эти файлы в Supabase Edge Functions Editor!

---

## 📝 ФАЙЛ 1: tutorial-routes.ts

**Создай новый файл в Supabase Editor:**
- Нажми "Add File"
- Название: `tutorial-routes.ts`
- Вставь код ниже:

```typescript
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const tutorialRouter = new Hono();

// Supabase client для работы с БД и Storage
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

/**
 * GET /tutorials
 * Получить список всех туториалов с прогрессом пользователя
 */
tutorialRouter.get('/', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    console.log('[tutorials] Fetching tutorials for user:', userId);

    // Получаем все туториалы
    const { data: tutorials, error: tutorialsError } = await supabase
      .from('tutorials')
      .select('*')
      .order('order_index', { ascending: true });

    if (tutorialsError) {
      throw tutorialsError;
    }

    // Получаем прогресс пользователя
    const { data: progress, error: progressError } = await supabase
      .from('user_video_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      throw progressError;
    }

    // Объединяем данные
    const tutorialsWithProgress = tutorials.map(tutorial => {
      const userProgress = progress?.find(p => p.tutorial_id === tutorial.id);
      return {
        ...tutorial,
        progress: userProgress,
        watched: userProgress?.watched || false,
        lastPosition: userProgress?.last_position || 0,
      };
    });

    console.log('[tutorials] Found', tutorialsWithProgress.length, 'tutorials');

    return c.json(tutorialsWithProgress);
  } catch (error) {
    console.error('[tutorials] Error:', error);
    return c.json(
      {
        error: 'Failed to fetch tutorials',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

/**
 * GET /tutorials/:id/video-url
 * Получить signed URL для просмотра видео
 */
tutorialRouter.get('/:id/video-url', async (c) => {
  try {
    const tutorialId = c.req.param('id');

    console.log('[tutorials] Getting video URL for tutorial:', tutorialId);

    // Получаем информацию о туториале
    const { data: tutorial, error: tutorialError } = await supabase
      .from('tutorials')
      .select('storage_path')
      .eq('id', tutorialId)
      .single();

    if (tutorialError || !tutorial) {
      return c.json({ error: 'Tutorial not found' }, 404);
    }

    // Генерируем signed URL для видео (действителен 1 час)
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from('tutorials')
      .createSignedUrl(tutorial.storage_path, 3600);

    if (urlError || !signedUrlData) {
      console.error('[tutorials] Failed to create signed URL:', urlError);
      return c.json({ error: 'Failed to generate video URL' }, 500);
    }

    console.log('[tutorials] Generated signed URL for:', tutorial.storage_path);

    return c.json({ url: signedUrlData.signedUrl });
  } catch (error) {
    console.error('[tutorials] Error:', error);
    return c.json(
      {
        error: 'Failed to get video URL',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

/**
 * POST /tutorials/progress
 * Обновить прогресс просмотра видео
 */
tutorialRouter.post('/progress', async (c) => {
  try {
    const { userId, tutorialId, position, watched } = await c.req.json();

    if (!userId || !tutorialId || position === undefined) {
      return c.json({ error: 'userId, tutorialId, and position are required' }, 400);
    }

    console.log('[tutorials] Updating progress:', { userId, tutorialId, position, watched });

    // Проверяем существует ли запись
    const { data: existing } = await supabase
      .from('user_video_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('tutorial_id', tutorialId)
      .single();

    if (existing) {
      // Обновляем существующую запись
      const updateData: any = {
        last_position: position,
        updated_at: new Date().toISOString(),
      };

      if (watched) {
        updateData.watched = true;
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_video_progress')
        .update(updateData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Создаем новую запись
      const { error } = await supabase
        .from('user_video_progress')
        .insert([{
          user_id: userId,
          tutorial_id: tutorialId,
          last_position: position,
          watched: watched || false,
          completed_at: watched ? new Date().toISOString() : null,
        }]);

      if (error) throw error;
    }

    console.log('[tutorials] Progress updated successfully');

    return c.json({ success: true });
  } catch (error) {
    console.error('[tutorials] Error updating progress:', error);
    return c.json(
      {
        error: 'Failed to update progress',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

export default tutorialRouter;
```

---

## 📝 ФАЙЛ 2: tutorial-admin-routes.ts

**Создай новый файл в Supabase Editor:**
- Нажми "Add File"
- Название: `tutorial-admin-routes.ts`
- Вставь код ниже:

```typescript
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const adminRouter = new Hono();

// Supabase client для работы с БД и Storage
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

/**
 * GET /tutorials/admin/list
 * Получить все туториалы (для админа)
 */
adminRouter.get('/list', async (c) => {
  try {
    console.log('[admin] Fetching all tutorials');

    const { data: tutorials, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }

    console.log('[admin] Found', tutorials.length, 'tutorials');

    return c.json(tutorials);
  } catch (error) {
    console.error('[admin] Error:', error);
    return c.json(
      {
        error: 'Failed to fetch tutorials',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

/**
 * POST /tutorials/upload
 * Загрузить видео в Storage и создать запись в БД
 */
adminRouter.post('/upload', async (c) => {
  try {
    console.log('[admin] Starting video upload');

    // Получить FormData из запроса
    const formData = await c.req.formData();
    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const duration = parseInt(formData.get('duration') as string);

    if (!videoFile || !title) {
      return c.json({ error: 'Missing video file or title' }, 400);
    }

    console.log('[admin] Uploading file:', videoFile.name, 'size:', videoFile.size);

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${timestamp}-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${fileExt}`;

    // Загружаем в Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('tutorials')
      .upload(fileName, videoFile, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[admin] Upload error:', uploadError);
      throw uploadError;
    }

    console.log('[admin] File uploaded:', uploadData.path);

    // Получаем следующий order_index
    const { data: lastTutorial } = await supabase
      .from('tutorials')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastTutorial?.order_index || 0) + 1;

    // Создаем запись в БД
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
      console.error('[admin] DB error:', dbError);
      // Удаляем файл если не удалось создать запись
      await supabase.storage.from('tutorials').remove([uploadData.path]);
      throw dbError;
    }

    console.log('[admin] Tutorial created:', tutorial.id);

    return c.json(tutorial);
  } catch (error) {
    console.error('[admin] Upload failed:', error);
    return c.json(
      {
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

/**
 * DELETE /tutorials/admin/:id
 * Удалить туториал (файл из Storage + запись из БД)
 */
adminRouter.delete('/:id', async (c) => {
  try {
    const tutorialId = c.req.param('id');

    console.log('[admin] Deleting tutorial:', tutorialId);

    // Получаем информацию о туториале
    const { data: tutorial, error: fetchError } = await supabase
      .from('tutorials')
      .select('storage_path')
      .eq('id', tutorialId)
      .single();

    if (fetchError || !tutorial) {
      return c.json({ error: 'Tutorial not found' }, 404);
    }

    // Удаляем файл из Storage
    const { error: storageError } = await supabase
      .storage
      .from('tutorials')
      .remove([tutorial.storage_path]);

    if (storageError) {
      console.error('[admin] Storage delete error:', storageError);
    }

    // Удаляем запись из БД
    const { error: dbError } = await supabase
      .from('tutorials')
      .delete()
      .eq('id', tutorialId);

    if (dbError) {
      throw dbError;
    }

    console.log('[admin] Tutorial deleted successfully');

    return c.json({ success: true });
  } catch (error) {
    console.error('[admin] Delete failed:', error);
    return c.json(
      {
        error: 'Failed to delete tutorial',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

export default adminRouter;
```

---

## 📝 ФАЙЛ 3: Обновить index.tsx

**В существующем файле `index.tsx` добавь:**

### В начало файла (после остальных импортов):

```typescript
import tutorialRoutes from "./tutorial-routes.ts";
import tutorialAdminRoutes from "./tutorial-admin-routes.ts";
```

### Перед строкой `Deno.serve(app.fetch);` добавь:

```typescript
// Tutorial routes (public)
app.route("/make-server-1c191bcf/tutorials", tutorialRoutes);

// Tutorial admin routes (upload/delete)
app.route("/make-server-1c191bcf/tutorials/admin", tutorialAdminRoutes);
```

---

## ✅ Готово!

После добавления всех файлов нажми **"Deploy"** в Supabase Editor!

🎉 **Админ панель будет работать!**
