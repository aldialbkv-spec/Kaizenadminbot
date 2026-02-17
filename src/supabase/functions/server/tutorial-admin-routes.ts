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
