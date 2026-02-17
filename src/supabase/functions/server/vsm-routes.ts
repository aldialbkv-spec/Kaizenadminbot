import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildVsmPrompt } from "./prompt-vsm-generation.ts";
import type { ValueStreamMap, VsmInput, VsmOutput } from "./types.ts";

export const vsmRouter = new Hono();

// Supabase client для работы с БД
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Generate VSM using OpenAI
vsmRouter.post("/generate", async (c) => {
  try {
    const body = await c.req.json();
    const input = body.input as VsmInput;

    if (!input || !input.companyName || !input.companyActivity || !input.processToImprove) {
      return c.json({ error: 'Company name, company activity and process to improve are required' }, 400);
    }

    // Build prompt from input
    const prompt = buildVsmPrompt(input);

    // Call OpenAI
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по Lean Manufacturing и Value Stream Mapping. Отвечай ТОЛЬКО валидным JSON без markdown или комментариев.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const output: VsmOutput = JSON.parse(data.choices[0].message.content.trim());

    // Generate title from company name + process
    const title = `Карта потока (VSM): ${input.companyName} - ${input.processToImprove.split(' ').slice(0, 4).join(' ')}`;

    // Save VSM to KV store
    const mapId = crypto.randomUUID();
    const map: ValueStreamMap = {
      id: mapId,
      title,
      input,
      output,
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`vsm:${mapId}`, map);

    // Сохраняем в test_history - тот же объект что и в KV
    try {
      await supabase.from('test_history').insert([{
        type: 'vsm',
        data: map
      }]);
    } catch (historyError) {
      console.error('Failed to save VSM to test_history:', historyError);
      // Не прерываем процесс, просто логируем
    }

    return c.json({ map });
  } catch (error) {
    console.log('Error generating VSM (Value Stream Map):', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate Value Stream Map' 
    }, 500);
  }
});

// Get all VSM maps
vsmRouter.get("/", async (c) => {
  try {
    const maps = await kv.getByPrefix<ValueStreamMap>('vsm:');
    
    // Sort by creation date (newest first)
    const sortedMaps = maps.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ maps: sortedMaps });
  } catch (error) {
    console.log('Error fetching VSM (Value Stream Map) maps:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch Value Stream Maps' 
    }, 500);
  }
});

// Get single VSM map
vsmRouter.get("/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const map = await kv.get<ValueStreamMap>(`vsm:${id}`);

    if (!map) {
      return c.json({ error: 'Value Stream Map not found' }, 404);
    }

    return c.json({ map });
  } catch (error) {
    console.log('Error fetching VSM map:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch VSM map' 
    }, 500);
  }
});

// Delete VSM map
vsmRouter.delete("/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`vsm:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting VSM map:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete VSM map' 
    }, 500);
  }
});

// Improve VSM text with AI
vsmRouter.post("/improve-text", async (c) => {
  try {
    const body = await c.req.json();
    const { text, context } = body as { text: string; context: 'activity' | 'process' };

    if (!text || !text.trim()) {
      return c.json({ error: 'Text is required' }, 400);
    }

    if (!context || !['activity', 'process'].includes(context)) {
      return c.json({ error: 'Invalid context. Must be "activity" or "process"' }, 400);
    }

    console.log(`[VSM] Improving ${context} text`);

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompts = {
      activity: `Ты — эксперт по бизнес-анализу и Lean Manufacturing. Твоя задача — улучшить описание основной деятельности компании для последующего анализа Value Stream Mapping.

ИСХОДНОЕ ОПИСАНИЕ:
${text}

ЗАДАЧА:
Улучши описание деятельности компании, сделав его более структурированным и информативным:

1. Четко опиши основной вид деятельности
2. Укажи ключевые продукты или услуги
3. Опиши основные процессы или этапы работы
4. Добавь контекст отрасли, если это уместно

ВАЖНО:
- Сохрани всю важную информацию из исходного описания
- Добавь логичные детали на основе контекста
- Описание должно быть 2-4 предложения, структурированное
- Фокус на производственных/операционных процессах

ФОРМАТ ОТВЕТА (JSON):
{
  "improvedText": "Улучшенное описание деятельности компании"
}

Возвращай ТОЛЬКО валидный JSON, без markdown разметки.`,
      process: `Ты — эксперт по процессному анализу и Lean Manufacturing. Твоя задача — улучшить описание процесса для последующего построения Value Stream Map.

ИСХОДНОЕ ОПИСАНИЕ:
${text}

ЗАДАЧА:
Улучши описание процесса, сделав его более четким и детализированным:

1. Четко определи начало процесса (триггер, инициатор)
2. Опиши ключевые этапы процесса
3. Укажи конечный результат процесса
4. Добавь важные детали о взаимодействиях между этапами

ВАЖНО:
- Сохрани всю важную информацию из исходного описания
- Опиши процесс как последовательность шагов от начала до конца
- Описание должно быть 2-4 предложения, структурированное
- Фокус на потоке создания ценности

ФОРМАТ ОТВЕТА (JSON):
{
  "improvedText": "Улучшенное описание процесса"
}

Возвращай ТОЛЬКО валидный JSON, без markdown разметки.`,
    };

    const prompt = prompts[context];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[VSM] OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON response
    const result = JSON.parse(content);

    console.log('[VSM] Text improved successfully');

    return c.json(result);
  } catch (error) {
    console.error('[VSM] Error improving text:', error);
    return c.json(
      {
        error: 'Failed to improve text',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});