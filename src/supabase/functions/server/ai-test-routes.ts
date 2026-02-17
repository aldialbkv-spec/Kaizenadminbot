import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";

const aiTestRouter = new Hono();

// Supabase client для работы с БД
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

/**
 * Шаблоны тестов (хардкод)
 */
const TEST_TEMPLATES = [
  {
    id: "a3-report-test",
    title: "Решить проблему",
    description: "Создание и анализ отчетов A3",
    icon: "FileText",
    route: "create-report",
  },
  {
    id: "vsm-test",
    title: "Улучшить процесс",
    description: "Создание карт потока создания ценности",
    icon: "GitBranch",
    route: "create-vsm",
  },
  {
    id: "qfd-test",
    title: "Улучшить качество",
    description: "Создание QFD и Дома качества",
    icon: "Award",
    route: "create-qfd",
  },
  {
    id: "hoshin-test",
    title: "Создать стратегию",
    description: "Стратегическое планирование Хосин Канри",
    icon: "Target",
    route: "create-hoshin",
  }
];

/**
 * Вызов OpenAI API
 */
async function callOpenAI(messages: Array<{ role: string; content: string }>, model = "gpt-4o-mini", temperature = 0.3) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

/**
 * POST /extract-schema
 * Извлекает структуру теста из промпта пользователя
 */
aiTestRouter.post("/extract-schema", async (c) => {
  try {
    const { prompt } = await c.req.json();

    if (!prompt || typeof prompt !== "string") {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const systemPrompt = `Ты помощник для создания тестов и отчетов.
Пользователь описывает какой тест нужен.

Твоя задача:
1. Определи какие поля нужно спросить у пользовател (inputs)
2. Определи какие данные должны быть в результате (outputs)
3. Для каждого output укажи тип: "text" (строка/параграф) или "table" (таблица)

ВАЖНО: Верни ТОЛЬКО валидный JSON без markdown, без комментариев.

Формат ответа:
{
  "inputs": ["название_поля_1", "название_поля_2"],
  "inputLabels": {
    "название_поля_1": "Красивый лейбл для UI",
    "название_поля_2": "Красивый лейбл для UI"
  },
  "outputs": {
    "название_секции_1": "text",
    "название_секции_2": "table"
  }
}

Пример:
Промпт: "Создай тест 5 Почему. Спроси проблему. Задай 5 раз почему. Выдай корневую причину."
Ответ:
{
  "inputs": ["problem"],
  "inputLabels": {
    "problem": "Опишите проблему"
  },
  "outputs": {
    "whys": "table",
    "rootCause": "text"
  }
}`;

    const content = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ]);
    
    // Убираем markdown если есть
    const jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
    const schema = JSON.parse(jsonContent);

    console.log("Extracted schema:", schema);

    return c.json(schema);
  } catch (error) {
    console.error("Error extracting schema:", error);
    return c.json(
      { 
        error: "Failed to extract schema from prompt",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

/**
 * POST /generate-report
 * Генерирует отчет на основе оригинального промпта и введенных данных
 */
aiTestRouter.post("/generate-report", async (c) => {
  try {
    const { originalPrompt, userInputs, outputSchema } = await c.req.json();

    if (!originalPrompt || !userInputs) {
      return c.json({ error: "originalPrompt and userInputs are required" }, 400);
    }

    // Формируем контекст с данными пользователя
    const userContext = Object.entries(userInputs)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const systemPrompt = `Ты помощник для создания отчетов и анализов.
Выполни задачу пользователя используя предоставленные данные.

ВАЖНО: 
1. Верни ТОЛЬКО валидный JSON без markdown, без комментариев
2. Структура JSON должна соответствовать описанию в промпте
3. Для полей типа "table" возвращай массив объектов
4. Для полей типа "text" возвращай строку

${outputSchema ? `Ожидаемая структура:\n${JSON.stringify(outputSchema, null, 2)}` : ''}`;

    const userPrompt = `${originalPrompt}

Данные пользователя:
${userContext}`;

    const content = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], "gpt-4o", 0.7);
    
    // Убираем markdown если есть
    const jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
    const result = JSON.parse(jsonContent);

    console.log("Generated report:", result);

    return c.json(result);
  } catch (error) {
    console.error("Error generating report:", error);
    return c.json(
      { 
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

/**
 * GET /test-templates
 * Получить список шаблонов тестов
 */
aiTestRouter.get("/test-templates", (c) => {
  return c.json(TEST_TEMPLATES);
});

/**
 * GET /test-history
 * Получить историю тестов пользователя
 */
aiTestRouter.get("/test-history", async (c) => {
  try {
    // Получаем userId и userRole из query параметров
    const userId = c.req.query('userId');
    const userRole = c.req.query('userRole');
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }
    
    console.log('[test-history] Fetching for userId:', userId, 'role:', userRole);
    
    // Если админ - показываем все тесты, иначе только пользовательские
    let query = supabase
      .from('test_history')
      .select('*');
    
    if (userRole !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    console.log('[test-history] Found', data?.length || 0, 'tests');
    
    return c.json(data || []);
  } catch (error) {
    console.error("Error fetching test history:", error);
    return c.json(
      { 
        error: "Failed to fetch test history",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

/**
 * POST /test-history
 * Сохранить результат теста в историю
 */
aiTestRouter.post("/test-history", async (c) => {
  try {
    const body = await c.req.json();
    
    // Теперь фронтенд отправляет { type, data, userId }
    const { type, data, userId } = body;
    
    // Проверяем что type, data и userId присутствуют
    if (!type || !data || !userId) {
      return c.json(
        { error: "Missing type, data or userId" },
        400
      );
    }
    
    console.log('[test-history] Saving test for userId:', userId);
    
    const { data: insertedData, error } = await supabase
      .from('test_history')
      .insert([{ type, data, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('[test-history] Test saved with id:', insertedData.id);
    
    return c.json(insertedData);
  } catch (error) {
    console.error("Error saving test to history:", error);
    return c.json(
      { 
        error: "Failed to save test to history",
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
});

export default aiTestRouter;