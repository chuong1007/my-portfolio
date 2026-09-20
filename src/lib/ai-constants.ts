export const AI_KNOWLEDGE_CATEGORIES = [
  'Giới thiệu',
  'Kỹ năng',
  'Kinh nghiệm',
  'Mục tiêu & Sở thích',
  'Liên hệ',
  'Khác'
] as const;

export type AIKnowledgeCategory = typeof AI_KNOWLEDGE_CATEGORIES[number];

export interface AIKnowledgeRecord {
  id: string;
  category: AIKnowledgeCategory | string;
  question: string;
  answer: string;
  keywords: string[];
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
