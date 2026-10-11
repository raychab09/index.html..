import { Question } from '../types';

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates an alternative natural phrasing for Arabic questions
 * without altering the factual meaning or correct answer.
 */
export function paraphraseArabicQuestion(text: string): string {
  const trimmed = text.trim();

  // Pattern 1: "ما هي عاصمة [البلد]؟"
  const capMatch = trimmed.match(/^ما\s+هي\s+عاصمة\s+([^؟?]+)[؟?]?$/i);
  if (capMatch) {
    const country = capMatch[1].trim();
    const variants = [
      `أي من المدن التالية هي العاصمة الرسمية لـ ${country}؟`,
      `ما هي المدينة التي تمثل عاصمة ${country}؟`,
      `العاصمة السياسية والرسمية لـ ${country} هي:`,
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Pattern 2: "من هو مؤلف [العمل]؟" or "من هو كاتب [العمل]؟"
  const authorMatch = trimmed.match(/^من\s+هو\s+(مؤلف|كاتب|شاعر|صاحب)\s+([^؟?]+)[؟?]?$/i);
  if (authorMatch) {
    const role = authorMatch[1].trim();
    const work = authorMatch[2].trim();
    const variants = [
      `أي من الشخصيات التالية هو ${role} ${work}؟`,
      `يُنسب ${work} إلى أي من الأسماء التالية؟`,
      `من الشخصية الأدبية التي قامت بـ وضع ${work}؟`,
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Pattern 3: "في أي عام [الحدث]؟" or "في أي سنة [الحدث]؟"
  const yearMatch = trimmed.match(/^في\s+أي\s+(عام|سنة)\s+([^؟?]+)[؟?]?$/i);
  if (yearMatch) {
    const event = yearMatch[2].trim();
    const variants = [
      `ما هي السنة التي شهدت ${event}؟`,
      `تاريخ وقوع ${event} كان في عام:`,
      `في أي سنة من السنوات التالية حدثت ${event}؟`,
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Pattern 4: "كم عدد [الشيء]؟"
  const countMatch = trimmed.match(/^كم\s+(عدد\s+)?([^؟?]+)[؟?]?$/i);
  if (countMatch && !countMatch[2].includes('يبلغ')) {
    const target = countMatch[2].trim();
    const variants = [
      `ما هو العدد الإجمالي لـ ${target}؟`,
      `كم يبلغ عدد ${target}؟`,
      `حدد العدد الصحيح المتعلق بـ ${target}:`,
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Pattern 5: "ما هو أسرع / أطول / أكبر / أصغر / أعلى [الشيء]؟"
  const superlativeMatch = trimmed.match(/^ما\s+(هو|هي)\s+(أسرع|أطول|أكبر|أصغر|أعلى|أقدم|أضخم)\s+([^؟?]+)[؟?]?$/i);
  if (superlativeMatch) {
    const adjective = superlativeMatch[2];
    const target = superlativeMatch[3].trim();
    const variants = [
      `أي مما يلي يعتبر ${adjective} ${target}؟`,
      `من بين الخيارات الآتية، ما هو ${adjective} ${target}؟`,
      `اختر الإجابة الأدق: ما هو ${adjective} ${target}؟`,
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Pattern 6: Subtle prefixes for standard questions
  if (trimmed.startsWith('ما هو ') || trimmed.startsWith('ما هي ')) {
    const rest = trimmed.replace(/^ما\s+(هو|هي)\s+/, '');
    const alt = [
      trimmed,
      `أي من الخيارات التالية يمثل ${rest}`,
      `حدد الإجابة الصحيحة: ${trimmed}`,
    ];
    return alt[Math.floor(Math.random() * alt.length)];
  }

  return trimmed;
}

/**
 * Randomizes the order of options for multiple choice questions
 */
export function randomizeQuestionOptions(question: Question): Question {
  if (question.type !== 'multiple_choice' || !question.options || question.options.length === 0) {
    return { ...question };
  }
  return {
    ...question,
    options: shuffleArray(question.options),
  };
}

/**
 * Creates a fresh, randomized variant of a question:
 * - Paraphrases the question text dynamically
 * - Shuffles choices
 * - Retains 100% factual accuracy
 */
export function createDynamicQuestionVariant(original: Question, variantIndex = 1): Question {
  const newQuestionText = paraphraseArabicQuestion(original.question);

  let newOptions = original.options;
  if (original.type === 'multiple_choice' && original.options) {
    newOptions = shuffleArray(original.options);
  }

  return {
    ...original,
    id: `${original.id}_v${variantIndex}_${Date.now().toString(36)}`,
    originalId: original.id,
    question: newQuestionText,
    options: newOptions,
  };
}
