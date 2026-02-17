import { Hono } from 'npm:hono';
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createQFDListsPrompt } from './prompt-qfd-lists.ts';
import { createQFDReportPrompt } from './prompt-qfd-report.ts';
import * as kv from './kv_store.tsx';

const qfdRoutes = new Hono();

// Supabase client для работы с БД
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Типы для QFD (определяем локально для backend)
interface QFDListsInput {
  companyDescription: string;
}

interface SearchCompanyInput {
  companyName: string;
}

interface ImproveDescriptionInput {
  description: string;
}

interface CustomerRequirement {
  id: string;
  text: string;
  category: string;
  importance?: number;
  relativeImportance?: number;
}

interface TechnicalCharacteristic {
  id: string;
  text: string;
  category: string;
  unit: string;
  direction: '↑' | '↓' | '○';
  absoluteWeight?: number;
  relativeWeight?: number;
  rank?: number;
  currentValue?: string;
  targetValue?: string;
  targetDate?: string;
}

interface QFDLists {
  customerRequirements: CustomerRequirement[];
  technicalCharacteristics: TechnicalCharacteristic[];
}

interface QFDReportInput {
  companyDescription: string;
  customerRequirements: CustomerRequirement[];
  technicalCharacteristics: TechnicalCharacteristic[];
  competitorsEnabled: boolean;
  competitors?: {
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  };
}

type RelationshipStrength = '9' | '3' | '1' | '';
type RelationshipMatrix = Record<string, RelationshipStrength>;

type CorrelationType = '++' | '+' | '-' | '--' | '';

interface Correlation {
  characteristic1Id: string;
  characteristic2Id: string;
  type: CorrelationType;
  description: string;
}

interface CompetitiveRating {
  requirementId: string;
  ourProduct: number;
  competitor1?: number;
  competitor2?: number;
  competitor3?: number;
  improvementNeeded?: number | null;
}

interface Action {
  id: string;
  action: string;
  requirementIds: string[];
  characteristicId: string;
  impact: number;
  duration: string;
  responsible: string;
}

interface QFDReport {
  id: string;
  companyDescription: string;
  productName?: string;
  customerRequirements: CustomerRequirement[];
  technicalCharacteristics: TechnicalCharacteristic[];
  competitorsEnabled: boolean;
  competitors?: {
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  };
  relationshipMatrix: RelationshipMatrix;
  correlations: Correlation[];
  competitiveRatings?: CompetitiveRating[];
  topPriorities?: string[];
  quickWins?: string[];
  criticalTradeoffs?: string[];
  competitiveStrategy?: {
    strengths: string[];
    gaps: string[];
    opportunities: string[];
  };
  actionPlan?: {
    phase1: string;
    phase2: string;
    phase3: string;
  };
  actions?: Action[];
  createdAt: string;
}

// Поиск информации о компании через AI с web_search
qfdRoutes.post('/search-company', async (c) => {
  try {
    const body: SearchCompanyInput = await c.req.json();
    const { companyName } = body;

    if (!companyName || !companyName.trim()) {
      return c.json({ error: 'Company name is required' }, 400);
    }

    console.log('[QFD] Searching for company:', companyName);

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Найди актуальную информацию о компании "${companyName}" и составь структурированное описание для QFD анализа.

ЗАДАЧА:
1. Найди информацию в интернете о компании "${companyName}"
2. Определи основную деятельность и продукты/услуги
3. Определи целевую аудиторию
4. Выдели ключевые особенности и позиционирование

ФОРМАТ ОТВЕТА (JSON):
{
  "found": true/false,
  "companyName": "Официальное название компании",
  "description": "Полное описание: основная деятельность, продукты/услуги, целевая аудитория, ключевые особенности (3-5 предложений)",
  "confidence": "high/medium/low",
  "suggestion": "Совет пользователю (если confidence = low или found = false)"
}

ПРАВИЛА:
- Если нашел достоверную информацию → found: true, confidence: high
- Если информации мало или неясна → found: true, confidence: low, добавь suggestion
- Если компания не найдена → found: false, suggestion с советом ввести описание вручную
- description должно быть конкретным и полезным для QFD анализа

Возвращай ТОЛЬКО валидный JSON.`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        instructions: 'You are an expert analyst. Search the web for company information and provide a structured description. IMPORTANT: Return ONLY valid JSON with no markdown formatting, no code blocks, no explanatory text - just pure JSON.',
        input: prompt,
        tools: [{ type: 'web_search_preview' }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[QFD] OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const output = data.output;
    if (!output || output.length === 0) {
      throw new Error('No response from OpenAI');
    }

    // Находим message с типом assistant в output
    let resultText = '';
    for (const item of output) {
      if (item.type === 'message' && item.role === 'assistant' && item.content) {
        // content это массив объектов
        for (const contentItem of item.content) {
          if (contentItem.type === 'output_text' && contentItem.text) {
            resultText += contentItem.text;
          }
        }
      }
    }

    if (!resultText) {
      console.error('[QFD] No text found in output. Full output:', JSON.stringify(output, null, 2));
      throw new Error('No text output from OpenAI');
    }

    // Убираем markdown код блоки если они есть
    let cleanedText = resultText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const result = JSON.parse(cleanedText);
    console.log('[QFD] Company search result:', { found: result.found, confidence: result.confidence });

    return c.json(result);
  } catch (error) {
    console.error('[QFD] Error searching company:', error);
    return c.json(
      {
        error: 'Failed to search company information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Улучшение описания компании через AI
qfdRoutes.post('/improve-description', async (c) => {
  try {
    const body: ImproveDescriptionInput = await c.req.json();
    const { description } = body;

    if (!description || !description.trim()) {
      return c.json({ error: 'Description is required' }, 400);
    }

    console.log('[QFD] Improving description');

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Ты — эксперт по Quality Function Deployment (QFD). Твоя задача — улучшить описание компании для последующего QFD анализа.

ИСХОДНОЕ ОПИСАНИЕ:
${description}

ЗАДАЧА:
Улучши описание, добавив недостающую информацию и структурировав её для эффективного QFD анализа:

1. Четко опиши основную деятельность и продукт/услугу
2. Укажи целевую аудиторию (кто клиенты)
3. Выдели ключевые характеристики и особенности
4. Добавь контекст, который поможет определить требования клиентов

ВАЖНО:
- Сохрани всю важную информацию из исходного описания
- Добавь логичные детали на основе контекста
- Описание должно быть 3-5 предложений, структурированное
- Фокус на аспектах, важных для анализа качества продукта

ФОРМАТ ОТВЕТА (JSON):
{
  "improvedDescription": "Улучшенное описание компании и продукта"
}

Возвращай ТОЛЬКО валидный JSON, без markdown разметки.`;

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
            content: 'You are an expert in Quality Function Deployment (QFD). Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[QFD] OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    console.log('[QFD] Description improved successfully');

    return c.json(result);
  } catch (error) {
    console.error('[QFD] Error improving description:', error);
    return c.json(
      {
        error: 'Failed to improve description',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Генерация списков (этап 1)
qfdRoutes.post('/generate-lists', async (c) => {
  try {
    const body: QFDListsInput = await c.req.json();
    const { companyDescription } = body;

    if (!companyDescription) {
      return c.json({ error: 'Company description is required' }, 400);
    }

    console.log('[QFD] Generating lists for:', { companyDescription });

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = createQFDListsPrompt(companyDescription);

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
            content: 'You are an expert in Quality Function Deployment (QFD). Always respond with valid JSON only, no markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[QFD] OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const lists: QFDLists = JSON.parse(content);

    console.log('[QFD] Generated lists:', {
      requirements: lists.customerRequirements?.length,
      characteristics: lists.technicalCharacteristics?.length,
    });

    return c.json(lists);
  } catch (error) {
    console.error('[QFD] Error generating lists:', error);
    return c.json(
      { 
        error: 'Failed to generate QFD lists', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      500
    );
  }
});

// Генерация полного QFD отчета (этап 2)
qfdRoutes.post('/generate-report', async (c) => {
  try {
    const body: QFDReportInput = await c.req.json();
    const {
      companyDescription,
      customerRequirements,
      technicalCharacteristics,
      competitorsEnabled,
      competitors,
    } = body;

    if (!companyDescription || !customerRequirements || !technicalCharacteristics) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (customerRequirements.length === 0 || technicalCharacteristics.length === 0) {
      return c.json({ error: 'Requirements and characteristics cannot be empty' }, 400);
    }

    console.log('[QFD] Generating full report:', {
      requirements: customerRequirements.length,
      characteristics: technicalCharacteristics.length,
      competitorsEnabled,
    });

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = createQFDReportPrompt(
      companyDescription,
      customerRequirements,
      technicalCharacteristics,
      competitorsEnabled,
      competitors
    );

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
            content: 'You are an expert in Quality Function Deployment (QFD) analysis. Always respond with valid JSON only, no markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[QFD] OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const reportData = JSON.parse(content);
    
    console.log('[QFD] Report data received from AI:', {
      hasActions: !!reportData.actions,
      actionsCount: reportData.actions?.length || 0,
      hasCorrelations: !!reportData.correlations,
      hasCompetitiveRatings: !!reportData.competitiveRatings,
    });

    // Создаем полный QFD отчет
    const reportId = `qfd_${Date.now()}`;
    
    // Извлекаем название п��одукта из описания (первые 50 символов)
    const productName = companyDescription.split('.')[0].substring(0, 50).trim();
    
    const report: QFDReport = {
      id: reportId,
      companyDescription,
      productName,
      customerRequirements: reportData.customerRequirements || customerRequirements,
      technicalCharacteristics: reportData.technicalCharacteristics || technicalCharacteristics,
      competitorsEnabled,
      competitors: competitorsEnabled ? competitors : undefined,
      relationshipMatrix: reportData.relationshipMatrix || {},
      correlations: reportData.correlations || [],
      competitiveRatings: competitorsEnabled ? reportData.competitiveRatings : undefined,
      topPriorities: reportData.topPriorities,
      quickWins: reportData.quickWins,
      criticalTradeoffs: reportData.criticalTradeoffs,
      competitiveStrategy: competitorsEnabled ? reportData.competitiveStrategy : undefined,
      actionPlan: reportData.actionPlan,
      actions: reportData.actions,
      createdAt: new Date().toISOString(),
    };

    // Сохраняем в KV store
    await kv.set(`qfd:${reportId}`, report);

    // Сохраняем в test_history - тот же объект что и в KV
    try {
      await supabase.from('test_history').insert([{
        type: 'qfd',
        data: report
      }]);
    } catch (historyError) {
      console.error('Failed to save QFD report to test_history:', historyError);
      // Не прерываем процесс, просто логируем
    }

    console.log('[QFD] Report generated successfully:', reportId);

    return c.json(report);
  } catch (error) {
    console.error('[QFD] Error generating report:', error);
    return c.json(
      {
        error: 'Failed to generate QFD report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Получение QFD отчета по ID
qfdRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get<QFDReport>(`qfd:${id}`);

    if (!report) {
      return c.json({ error: 'QFD report not found' }, 404);
    }

    return c.json(report);
  } catch (error) {
    console.error('[QFD] Error fetching report:', error);
    return c.json(
      {
        error: 'Failed to fetch QFD report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Получение всех QFD отчетов
qfdRoutes.get('/', async (c) => {
  try {
    const reports = await kv.getByPrefix<QFDReport>('qfd:');
    
    // Сортируем по дате создания (новые первые)
    const sortedReports = reports.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json(sortedReports);
  } catch (error) {
    console.error('[QFD] Error fetching reports:', error);
    return c.json(
      {
        error: 'Failed to fetch QFD reports',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Удаление QFD отчета
qfdRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Проверяем, существует ли отчет
    const report = await kv.get<QFDReport>(`qfd:${id}`);
    if (!report) {
      return c.json({ error: 'QFD report not found' }, 404);
    }

    // Удаляем отчет
    await kv.del(`qfd:${id}`);

    console.log('[QFD] Report deleted successfully:', id);

    return c.json({ success: true });
  } catch (error) {
    console.error('[QFD] Error deleting report:', error);
    return c.json(
      {
        error: 'Failed to delete QFD report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default qfdRoutes;