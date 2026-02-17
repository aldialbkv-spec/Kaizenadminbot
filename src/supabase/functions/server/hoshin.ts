import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { createClient } from "jsr:@supabase/supabase-js@2";
import { generateTextWithOpenAI } from './openai-client.ts';
import { getImproveMissionPrompt } from './prompt-hoshin-mission.ts';
import { getHoshinVisionPrompt } from './prompt-hoshin-vision.ts';
import { getHoshinValuesPrompt } from './prompt-hoshin-values.ts';
import { getHoshinGoalsPrompt } from './prompt-hoshin-goals.ts';
import { getHoshinValidationPrompt } from './prompt-hoshin-validation.ts';
import { getHoshinStrategyPrompt } from './prompt-hoshin-strategy.ts';

const app = new Hono();

// Supabase client для работы с БД
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Генерация Hoshin Kanri отчета
app.post('/generate', async (c) => {
  try {
    const input = await c.req.json();
    
    // Валидация входных данных
    if (!input.mission || !input.vision || !input.values || !input.goals) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    console.log('Generating Hoshin Kanri strategy for input:', {
      mission: input.mission.substring(0, 50) + '...',
      vision: input.vision.substring(0, 50) + '...',
      values: input.values.substring(0, 50) + '...',
      goals: input.goals.substring(0, 50) + '...',
    });

    // Генерируем стратегию через OpenAI
    const prompt = getHoshinStrategyPrompt(
      input.mission,
      input.vision,
      input.values,
      input.goals
    );

    const strategyResult = await generateTextWithOpenAI(prompt);

    // Парсим JSON ответ от OpenAI
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(strategyResult);
    } catch (parseError) {
      console.error('Error parsing strategy result:', parseError);
      console.error('Raw result:', strategyResult);
      return c.json({ error: 'Failed to parse strategy result' }, 500);
    }

    // Создаем отчет
    const report = {
      id: crypto.randomUUID(),
      title: `Hoshin Kanri - ${new Date().toLocaleDateString('ru-RU')}`,
      input,
      output: parsedOutput,
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Successfully generated Hoshin report:', {
      id: report.id,
      tasksCount: parsedOutput.tasks?.length || 0,
    });

    // Сохраняем в KV Store
    await kv.set(`hoshin:${report.id}`, report);

    // Сохраняем в test_history - тот же объект что и в KV
    try {
      await supabase.from('test_history').insert([{
        type: 'hoshin',
        data: report
      }]);
    } catch (historyError) {
      console.error('Failed to save Hoshin report to test_history:', historyError);
      // Не прерываем процесс, просто логируем
    }

    return c.json(report);
  } catch (error) {
    console.error('Error generating Hoshin report:', error);
    return c.json({ 
      error: 'Failed to generate Hoshin report',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Получить список всех отчетов
app.get('/list', async (c) => {
  try {
    const reports = await kv.getByPrefix('hoshin:');
    
    // Сортируем по дате создания (новые первые)
    reports.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return c.json(reports);
  } catch (error) {
    console.error('Error fetching Hoshin reports:', error);
    return c.json({ error: 'Failed to fetch Hoshin reports' }, 500);
  }
});

// Получить один отчет по ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get(`hoshin:${id}`);

    if (!report) {
      return c.json({ error: 'Hoshin report not found' }, 404);
    }

    return c.json(report);
  } catch (error) {
    console.error('Error fetching Hoshin report:', error);
    return c.json({ error: 'Failed to fetch Hoshin report' }, 500);
  }
});

// Удалить отчет
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`hoshin:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting Hoshin report:', error);
    return c.json({ error: 'Failed to delete Hoshin report' }, 500);
  }
});

// Улучшить поле через ИИ (универсальный эндпоинт)
app.post('/improve-input', async (c) => {
  try {
    const { text, fieldType } = await c.req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return c.json({ error: 'Text is required' }, 400);
    }

    if (!fieldType || typeof fieldType !== 'string') {
      return c.json({ error: 'Field type is required' }, 400);
    }

    let prompt: string;
    
    switch (fieldType) {
      case 'mission':
        prompt = getImproveMissionPrompt(text);
        break;
      case 'vision':
        prompt = getHoshinVisionPrompt(text);
        break;
      case 'values':
        prompt = getHoshinValuesPrompt(text);
        break;
      case 'goals':
        prompt = getHoshinGoalsPrompt(text);
        break;
      default:
        return c.json({ error: 'Invalid field type' }, 400);
    }

    const improvedText = await generateTextWithOpenAI(prompt);

    return c.json({ improvedText });
  } catch (error) {
    console.error(`Error improving ${fieldType} text:`, error);
    return c.json({ error: 'Failed to improve text' }, 500);
  }
});

// Проверка согласованности всех элементов Хосин Канри
app.post('/validate', async (c) => {
  try {
    const { mission, vision, values, goals } = await c.req.json();

    if (!mission || !vision || !values || !goals) {
      return c.json({ error: 'All fields are required for validation' }, 400);
    }

    const prompt = getHoshinValidationPrompt(mission, vision, values, goals);
    const validationResult = await generateTextWithOpenAI(prompt);

    // Парсим JSON ответ от OpenAI
    let parsedResult;
    try {
      parsedResult = JSON.parse(validationResult);
    } catch (parseError) {
      console.error('Error parsing validation result:', parseError);
      return c.json({ error: 'Failed to parse validation result' }, 500);
    }

    return c.json(parsedResult);
  } catch (error) {
    console.error('Error validating Hoshin elements:', error);
    return c.json({ error: 'Failed to validate Hoshin elements' }, 500);
  }
});

export default app;