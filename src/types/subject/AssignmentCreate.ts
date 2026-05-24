/**
 * Type alias for assignment question types.
 *
 * Represents the allowed types of questions in an assignment.
 * - SingleChoice: Question with one correct answer.
 * - MultipleChoice: Question with multiple correct answers.
 * - Text: Question requiring a text answer.
 */
export type AssignmentQuestionType = "SingleChoice" | "MultipleChoice" | "Text";

/**
 * Interface for creating/updating assignment questions.
 *
 * Represents a question within an assignment, including its type, content, and possible options.
 *
 * @property {string} [id] - Unique identifier of the question (GUID, optional for creation).
 * @property {AssignmentQuestionType} questionType - Type of the question. Allowed values: SingleChoice, MultipleChoice, Text.
 * @property {string} questionData - Data for the question (text, etc.).
 * @property {AssignmentQuestionOptionRequest[]} [options] - Options for the question (used for choice questions).
 *
 * @returns {AssignmentQuestionRequest} Assignment question object.
 * @throws {Error} May throw error if invalid questionType is provided.
 */
export interface AssignmentQuestionRequest {
  id?: string;
  questionType: AssignmentQuestionType;
  questionData: string;
  options?: AssignmentQuestionOptionRequest[];
}

/**
 * Interface for creating/updating assignment question options.
 * @property {string} [id] - Unique identifier of the option (GUID, optional for creation).
 * @property {string} text - Option text.
 */
export interface AssignmentQuestionOptionRequest {
  id?: string;
  text: string;
}

/**
 * Interface for creating/updating assignments.
 * @property {string} [content] - Content/title of the assignment.
 * @property {string} [assignmentData] - Assignment-specific data (JSON string).
 * @property {number} [maxPoints] - Maximum points for cumulative grading mode.
 * @property {boolean} [selfAssessmentEnabled] - Enable self-assessment for students.
 * @property {string} [selfAssessmentVisibilityDate] - ISO date when criteria become visible.
 * @property {string} [deadLine] - ISO deadline for submission.
 * @property {AssignmentQuestionRequest[]} [questions] - Questions for the assignment.
 */
export interface UpsertAssignmentRequest {
  content?: string;
  assignmentData?: string;
  maxPoints?: number | null;
  selfAssessmentEnabled?: boolean | null;
  selfAssessmentVisibilityDate?: string | null;
  deadLine?: string | null;
  questions?: AssignmentQuestionRequest[];
}

