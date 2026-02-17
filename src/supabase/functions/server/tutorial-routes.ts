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
