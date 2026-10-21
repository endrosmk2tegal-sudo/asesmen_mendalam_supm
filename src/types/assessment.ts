export type DepartmentCode = 'NKPI' | 'TKPI' | 'APPL' | 'APHP';
export type AssessmentType = 'Diagnostik' | 'Formatif' | 'Sumatif';
export type InstrumentType = 'Pilihan Ganda' | 'Esai/Uraian' | 'Praktik/Unjuk Kerja' | 'Observasi' | 'Campuran';
export type SoloLevel = 'Prastruktural' | 'Unistruktural' | 'Multistruktural' | 'Relasional' | 'Abstrak Diperluas';

export interface AssessmentFormValues {
  teacherName: string;
  subject: string;
  school: string;
  gradeLevel: 'SMK';
  gradeClass: 'X' | 'XI' | 'XII';
  department: DepartmentCode;
  assessmentType: AssessmentType;
  materialTopic: string;
  learningObjectives: string;
  additionalIndicators: string;
  instrumentType: InstrumentType;
  itemCount: number;
  soloTaxonomyLevels: SoloLevel[];
  additionalInstructions: string;
}

export interface KisiKisiItem {
  number: number;
  learningObjective: string;
  topic: string;
  indicator: string;
  soloLevel: SoloLevel;
  instrumentType: string;
  itemNumber: number;
  weightScore: number;
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface QuestionItem {
  number: number;
  instrumentType: 'Pilihan Ganda' | 'Esai' | 'Praktik' | 'Observasi';
  soloLevel: SoloLevel;
  stimulus?: string;
  questionText: string;
  options?: QuestionOption[]; // Wajib 5 opsi A, B, C, D, E untuk Pilihan Ganda
  instructions?: string;
  maxScore: number;
}

export interface AnswerKeyItem {
  number: number;
  instrumentType: string;
  correctAnswer: string;
  fullAnswerText?: string;
  explanation: string;
  expectedElements?: string[];
}

export interface RubricLevel {
  level: string;
  score: number;
  description: string;
}

export interface RubricCriterion {
  aspect: string;
  weight: number;
  levels: RubricLevel[];
}

export interface FollowUpRecommendation {
  category: string;
  action: string;
}

export interface ScoringGuide {
  instrumentSummary: string;
  maxScore: number;
  scoringFormula: string;
  passingGradeAdvice: string;
  criteria?: RubricCriterion[];
  followUpRecommendations: FollowUpRecommendation[];
}

export interface QualityAudit {
  requestedItems: number;
  generatedItems: number;
  pgItemCount: number;
  allPgHave5Options: boolean;
  kisiKisiMappedCount: number;
  hasSeparateAnswerKey: boolean;
  hasRubric: boolean;
  notes: string[];
}

export interface AssessmentPackage {
  metadata: {
    title: string;
    school: string;
    teacherName: string;
    subject: string;
    gradeClass: string;
    department: DepartmentCode;
    departmentFullName: string;
    assessmentType: AssessmentType;
    instrumentType: InstrumentType;
    itemCount: number;
    date: string;
  };
  kisiKisi: KisiKisiItem[];
  questions: QuestionItem[];
  answerKeys: AnswerKeyItem[];
  rubric: ScoringGuide;
  qualityAudit: QualityAudit;
}

export type ExportSection = 'all' | 'kisi-kisi' | 'soal' | 'kunci' | 'rubrik';
