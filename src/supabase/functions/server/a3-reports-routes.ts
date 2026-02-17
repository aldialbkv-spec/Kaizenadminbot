import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { generateWithOpenAI } from "./openai-client.ts";
import { buildA3Prompt } from "./prompt-a3-generation.ts";
import { buildImproveInputPrompt } from "./prompt-improve-input.ts";
import { buildValidateInputPrompt } from "./prompt-validate-input.ts";
import type { A3Report, A3ReportInput, A3ReportOutput } from "./types.ts";

export const a3ReportsRouter = new Hono();

// Supabase client для работы с БД
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Validate input field using OpenAI
a3ReportsRouter.post("/validate-input", async (c) => {
  try {
    const body = await c.req.json();
    const { text, fieldType } = body as { text: string; fieldType: keyof A3ReportInput };

    if (!text || !fieldType) {
      return c.json({ error: 'Text and fieldType are required' }, 400);
    }

    if (text.trim().length < 3) {
      return c.json({ 
        isValid: false, 
        message: 'Ответ слишком короткий. Добавьте больше деталей.' 
      });
    }

    // Build prompt for validating input
    const prompt = buildValidateInputPrompt(text, fieldType);

    // Call OpenAI with low temperature for strict validation
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты строгий валидатор ответов для A3 отчетов. Проверяй соответствие методике 5W1H. Отвечай ТОЛЬКО валидным JSON без дополнительного текста, markdown или комментариев.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content.trim());

    return c.json(result);
  } catch (error) {
    console.log('Error validating input:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to validate input' 
    }, 500);
  }
});

// Improve input field using OpenAI
a3ReportsRouter.post("/improve-input", async (c) => {
  try {
    const body = await c.req.json();
    const { text, fieldType } = body as { text: string; fieldType: keyof A3ReportInput };

    if (!text || !fieldType) {
      return c.json({ error: 'Text and fieldType are required' }, 400);
    }

    if (text.trim().length < 5) {
      return c.json({ error: 'Text is too short to improve' }, 400);
    }

    // Build prompt for improving input
    const prompt = buildImproveInputPrompt(text, fieldType);

    // Call OpenAI with lower temperature for more focused output
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты помощник для улучшения описаний проблем в A3 отчетах. Твоя задача - сделать текст более структурированным, конкретным и полезным для анализа. СТРОГО следуй инструкциям по методике 5W1H и не добавляй информацию, которая относится к другим полям.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const improvedText = data.choices[0].message.content.trim();

    return c.json({ improvedText });
  } catch (error) {
    console.log('Error improving input:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to improve input' 
    }, 500);
  }
});

// Generate A3 report using OpenAI
a3ReportsRouter.post("/generate", async (c) => {
  try {
    const body = await c.req.json();
    const input = body.input as A3ReportInput;

    if (!input) {
      return c.json({ error: 'Input is required' }, 400);
    }

    // Build prompt from input
    const prompt = buildA3Prompt(input);

    // Generate output using OpenAI
    const output: A3ReportOutput = await generateWithOpenAI(prompt);

    // Save report to KV store
    const reportId = crypto.randomUUID();
    const report: A3Report = {
      id: reportId,
      title: output.title,
      input,
      output,
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`a3-report:${reportId}`, report);

    // Сохраняем в test_history - тот же объект что и в KV
    try {
      await supabase.from('test_history').insert([{
        type: 'a3',
        data: report
      }]);
    } catch (historyError) {
      console.error('Failed to save A3 report to test_history:', historyError);
      // Не прерываем процесс, просто логируем
    }

    return c.json({ report });
  } catch (error) {
    console.log('Error generating A3 report:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate A3 report' 
    }, 500);
  }
});

// Get all A3 reports
a3ReportsRouter.get("/", async (c) => {
  try {
    const reports = await kv.getByPrefix<A3Report>('a3-report:');
    
    // Sort by creation date (newest first)
    const sortedReports = reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ reports: sortedReports });
  } catch (error) {
    console.log('Error fetching A3 reports:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch A3 reports' 
    }, 500);
  }
});

// Get single A3 report
a3ReportsRouter.get("/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get<A3Report>(`a3-report:${id}`);

    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    return c.json({ report });
  } catch (error) {
    console.log('Error fetching A3 report:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch A3 report' 
    }, 500);
  }
});

// Delete A3 report
a3ReportsRouter.delete("/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`a3-report:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting A3 report:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete A3 report' 
    }, 500);
  }
});