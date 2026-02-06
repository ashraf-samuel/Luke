
export enum StudentLevel {
  ELEMENTARY = 'Upper Elementary',
  MIDDLE = 'Middle School',
  HIGH = 'High School'
}

export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export type FeedbackType = 'immediate' | 'end';

export interface Question {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: Question[];
}

export interface AppState {
  step: 'setup' | 'loading' | 'review' | 'quiz' | 'results';
  level: StudentLevel;
  difficulty: DifficultyLevel;
  feedbackType: FeedbackType;
  chapter: number;
  sourceType: 'text' | 'image' | 'reference';
  content: string;
  images: string[]; // Base64 strings
  quiz: QuizData | null;
  score: number;
  userAnswers: (number | null)[];
}
