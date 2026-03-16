export interface Course {
  id: string;
  slug?: string | null;
  name: string;
  emoji: string;
  color: string;
  accent: string;
  full_exam?: FullExam;
}

export interface Unit {
  id: number;
  course_id: string;
  unit_number: number;
  name: string;
  key_concepts?: KeyConcept[];
  unit_exam?: UnitExam;
}

export interface Chapter {
  id: number;
  unit_id: number;
  chapter_number: number;
  name: string;
  notes?: string;
  quiz?: QuizQuestion[];
}

export interface KeyConcept {
  term: string;
  definition: string;
  example: string;
  category: "vocabulary" | "formula" | "person" | "event" | "process" | "theory" | "law";
}

export interface Flashcard {
  id: number;
  unit_id: number;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  answer_index: number;
  explanation: string;
}

export interface UnitExam {
  multiple_choice: QuizQuestion[];
  free_response: FRQ[];
}

export interface FRQ {
  question: string;
  rubric: string;
  sample_response: string;
}

export interface FullExam {
  exam_info: {
    total_time_minutes: number;
    mc_count: number;
    frq_count: number;
    mc_time_minutes: number;
    frq_time_minutes: number;
    scoring_note: string;
  };
  multiple_choice: (QuizQuestion & { unit: string })[];
  free_response: (FRQ & { type: string; points: number; time_suggested_minutes: number })[];
}
