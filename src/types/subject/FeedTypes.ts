/**
 * Enum representing possible member roles in a subject.
 * @enum {string}
 */
export enum MemberRole {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student'
}

/**
 * Interface representing a comment returned from API.
 * @property {string} id - Unique identifier of the comment (GUID).
 * @property {string} targetType - Type of the entity the comment is attached to.
 * @property {string} targetId - ID of the entity the comment is attached to (GUID).
 * @property {string} authorId - ID of the comment author (GUID).
 * @property {string} text - Content of the comment.
 * @property {string} createdAt - Date and time when the comment was created (ISO string).
 */
export interface Comment {
  id: string;
  targetType: string;
  targetId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

/**
 * Interface representing an option for assignment question.
 * @property {string} id - Unique identifier of the option (GUID).
 * @property {string} text - Option text.
 */
export interface AssignmentQuestionOption {
  id: string;
  text: string;
}

/**
 * Interface representing a question in an assignment.
 * @property {string} id - Unique identifier of the question (GUID).
 * @property {string} questionType - Type of the question.
 * @property {string} questionData - Data for the question (text, etc).
 * @property {AssignmentQuestionOption[]} options - Options for the question.
 */
export interface AssignmentQuestion {
  id: string;
  questionType: string;
  questionData: string;
  options: AssignmentQuestionOption[];
}

/**
 * Interface representing an assignment returned from API.
 * @property {string} id - Unique identifier of the assignment (GUID).
 * @property {string} subjectId - ID of the subject (GUID).
 * @property {string} authorId - ID of the assignment author (GUID).
 * @property {string} postType - Type of the post ("assignment").
 * @property {string} content - Content of the assignment post.
 * @property {string} createdAt - Date and time when the assignment was created (ISO string).
 * @property {string} assignmentData - Assignment-specific data (JSON string).
 * @property {AssignmentQuestion[]} questions - Questions in the assignment.
 */
export interface Assignment {
  id: string;
  subjectId: string;
  authorId: string;
  postType: string;
  content: string;
  createdAt: string;
  assignmentData: string;
  questions: AssignmentQuestion[];
}

/**
 * Interface representing a post returned from API.
 * @property {string} id - Unique identifier of the post (GUID).
 * @property {string} authorId - ID of the post author (GUID).
 * @property {string} postType - Type of the post ("announcement", "material", "assignment").
 * @property {string} content - Content of the post.
 * @property {string} createdAt - Date and time when the post was created (ISO string).
 * @property {string} fileName - Name of the attached file (for material posts).
 * @property {string} storagePath - Path to the file in storage (for material posts).
 * @property {number} fileSize - Size of the file in bytes (for material posts).
 * @property {string} assignmentData - Assignment-specific data (for assignment posts).
 * @property {AssignmentQuestion[]} questions - Questions (for assignment posts).
 */
export interface Post {
  id: string;
  authorId: string;
  postType: string;
  content: string;
  createdAt: string;
  fileName?: string;
  storagePath?: string;
  fileSize?: number;
  assignmentData?: string;
  questions?: AssignmentQuestion[];
}
