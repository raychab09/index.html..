import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = process.env.NODE_ENV === 'production' && process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : 3000;

  app.use(express.json({ limit: '2mb' }));

  // Health check & capabilities
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Dynamic Question Generator using Gemini API
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const {
        categoryId = 'general',
        categoryName = 'معلومات عامة',
        difficulty = 'medium',
        count = 10,
        recentQuestions = [],
      } = req.body;

      const ai = getAi();
      if (!ai) {
        return res.status(200).json({
          success: false,
          reason: 'NO_API_KEY',
          message: 'Gemini API key is not configured; using offline smart bank.',
        });
      }

      const recentSample = Array.isArray(recentQuestions)
        ? recentQuestions.slice(0, 40).join(' | ')
        : '';

      const prompt = `أنت خبير موسوعي رائد في تصميم أسئلة المسابقات الثقافية والتعليمية باللغة العربية الفصحى لتطبيق "تحدي المعرفة".
المطلوب منك: تأليف وتوليد ${count} أسئلة جديدة حصرية وغير مكررة في المجال التالي:
- المجال: ${categoryName} (${categoryId})
- مستوى الصعوبة المطلوب بدقة: ${difficulty} (مستويات الصعوبة:
  * easy = سهل، مباشر، يناسب الجميع وممتع.
  * medium = متوسط، يحتاج ثقافة عامة وتفكير.
  * hard = متقدم ومفصل، لرواد المعرفة.
  * expert = تخصصي جداً وعميق، لأصحاب الخبرة الاستثنائية).

قواعد ومعايير الجودة الصارمة لمنع التكرار وضمان الدقة:
1. تجنب تكرار أي سؤال أو موضوع أو صياغة من الأسئلة السابقة التالية إطلاقاً:
[${recentSample}]
2. تأكد 100% من صحة كل حقيقة علمية أو تاريخية أو دينية أو رياضية قبل إدراجها، وتجنب أي خلافات أو معلومات غير دقيقة.
3. كل سؤال يجب أن يحتوي على 4 خيارات مختلفة تماماً وواضحة، مع خيار واحد فقط صحيح تماماً.
4. يجب أن تتطابق قيمة "correctAnswer" حرفياً وبدقة تامة مع أحد الخيارات الأربعة الموجودة في "options".
5. اكتب شرحاً علمياً أو توضيحياً موجزاً وشيقاً في "explanation" يشرح سبب الإجابة الصحيحة.
6. اخلط ترتيب الخيارات بحيث لا يكون الخيار الصحيح دائماً في نفس الموقع.
7. استخدم صياغات عربية فصيحة وسليمة ومتنوعة.

أرجع النتيجة بصيغة JSON فقط، على هيئة مصفوفة من الكائنات كما يلي:
[
  {
    "question": "نص السؤال الفصيح والواضح؟",
    "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
    "correctAnswer": "الخيار الصحيح المطابق لأحد الخيارات الأربعة",
    "explanation": "شرح توضيحي وممتع عن الإجابة الصحيحة",
    "difficulty": "${difficulty}",
    "categoryId": "${categoryId}",
    "type": "multiple_choice"
  }
]`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let responseText = '[]';
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.8,
            },
          });
          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`Model ${model} unavailable, trying next model in chain...`, mErr?.message || mErr);
        }
      }

      if (responseText === '[]' && lastError) {
        return res.status(200).json({
          success: false,
          reason: 'MODEL_UNAVAILABLE',
          message: lastError?.message || 'All AI models currently busy',
        });
      }

      let parsedQuestions: any[] = [];
      try {
        parsedQuestions = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini output JSON:', parseErr, responseText);
        return res.status(200).json({
          success: false,
          reason: 'JSON_PARSE_ERROR',
          message: 'Failed to parse generated questions',
        });
      }

      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        return res.status(200).json({
          success: false,
          reason: 'EMPTY_RESULT',
          message: 'No questions generated',
        });
      }

      // Sanitize and validate generated questions
      const validQuestions = parsedQuestions
        .filter((q) => {
          return (
            q &&
            typeof q.question === 'string' &&
            q.question.trim().length > 5 &&
            Array.isArray(q.options) &&
            q.options.length >= 4 &&
            typeof q.correctAnswer === 'string' &&
            q.options.includes(q.correctAnswer.trim())
          );
        })
        .map((q, idx) => {
          const cleanedOptions = Array.from(new Set(q.options.map((o: any) => String(o).trim()))).slice(0, 4);
          const correctAnswer = String(q.correctAnswer).trim();
          // Ensure correctAnswer is included in options
          if (!cleanedOptions.includes(correctAnswer)) {
            cleanedOptions[0] = correctAnswer;
          }

          return {
            id: `ai_${categoryId}_${difficulty}_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            categoryId,
            difficulty,
            type: 'multiple_choice' as const,
            question: q.question.trim(),
            options: cleanedOptions,
            correctAnswer,
            explanation: q.explanation ? String(q.explanation).trim() : `الإجابة الصحيحة هي: ${correctAnswer}`,
            isAiGenerated: true,
          };
        });

      if (validQuestions.length === 0) {
        return res.status(200).json({
          success: false,
          reason: 'VALIDATION_FAILED',
          message: 'Generated questions did not pass validation',
        });
      }

      return res.status(200).json({
        success: true,
        questions: validQuestions,
        count: validQuestions.length,
      });
    } catch (err: any) {
      console.error('Error generating questions with Gemini:', err);
      return res.status(200).json({
        success: false,
        reason: 'SERVER_ERROR',
        message: err?.message || 'Error occurred while generating questions',
      });
    }
  });

  // Serve public static assets (manifest, service worker, icons)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
