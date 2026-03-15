/**
 * Interface representing a comment returned from API.
 * @property {string} id - Unique identifier of the comment (GUID).
 * @property {string} targetType - Type of the entity the comment is attached to.
 * @property {string} targetId - ID of the entity the comment is attached to (GUID).
 * @property {string} authorId - ID of the comment author (GUID).
 * @property {string} text - Content of the comment.
 * @property {string} createdAt - Date and time when the comment was created (ISO 8601 date-time string).
 */
export interface CommentResponse {
  id: string;
  targetType: string;
  targetId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

/**
 * Interface representing an option for assignment question returned from API.
 * @property {string} id - Unique identifier of the option (GUID).
 * @property {string} text - Option text.
 */
export interface AssignmentQuestionOptionResponse {
  id: string;
  text: string;
}

/**
 * Interface representing a question in an assignment returned from API.
 * @property {string} id - Unique identifier of the question (GUID).
 * @property {string} questionType - Type of the question.
 * @property {string} questionData - Data for the question (text, etc.).
 * @property {AssignmentQuestionOptionResponse[]} options - Options for the question.
 */
export interface AssignmentQuestionResponse {
  id: string;
  questionType: string;
  questionData: string;
  options: AssignmentQuestionOptionResponse[];
}

/**
 * Interface representing an assignment returned from API.
 * @property {string} id - Unique identifier of the assignment (GUID).
 * @property {string} subjectId - ID of the subject (GUID).
 * @property {string} authorId - ID of the assignment author (GUID).
 * @property {string} postType - Type of the post ("assignment").
 * @property {string} content - Content of the assignment post.
 * @property {string} createdAt - Date and time when the assignment was created (ISO 8601 date-time string).
 * @property {string} assignmentData - Assignment-specific data (JSON string).
 * @property {AssignmentQuestionResponse[]} questions - Questions in the assignment.
 */
export interface AssignmentResponse {
  id: string;
  subjectId: string;
  authorId: string;
  postType: string;
  content: string;
  createdAt: string;
  assignmentData: string;
  questions: AssignmentQuestionResponse[];
}

/**
 * Interface representing a post returned from API (base type).
 * @property {string} id - Unique identifier of the post (GUID).
 * @property {string} authorId - ID of the post author (GUID).
 * @property {string} postType - Type of the post ("announcement", "material", "assignment").
 * @property {string} content - Content of the post.
 * @property {string} createdAt - Date and time when the post was created (ISO 8601 date-time string).
 * @property {string} $type - Discriminator for post type.
 */
export interface PostResponse {
  id: string;
  authorId: string;
  postType: string;
  content: string;
  createdAt: string;
  $type: string;
}

/**
 * Interface representing an announcement post returned from API.
 * Extends PostResponse.
 */
export interface AnnouncementPostResponse extends PostResponse {}

/**
 * Interface representing a material post returned from API.
 * Extends PostResponse.
 * @property {string} fileName - Name of the attached file.
 * @property {string} storagePath - Path to the file in storage.
 * @property {number} fileSize - Size of the file in bytes.
 * @property {string} downloadUrl - URL for downloading the file.
 */
export interface MaterialPostResponse extends PostResponse {
  fileName: string;
  storagePath: string;
  fileSize: number;
  downloadUrl: string;
}

/**
 * Interface representing an assignment post returned from API.
 * Extends PostResponse.
 * @property {string} subjectId - ID of the subject (GUID).
 * @property {string} assignmentData - Assignment-specific data (JSON string).
 * @property {AssignmentPostQuestionResponse[]} questions - Questions in the assignment post.
 */
export interface AssignmentPostResponse extends PostResponse {
  subjectId: string;
  assignmentData: string;
  questions: AssignmentPostQuestionResponse[];
}

/**
 * Interface representing a question in an assignment post returned from API.
 * @property {string} id - Unique identifier of the question (GUID).
 * @property {string} questionType - Type of the question.
 * @property {string} questionData - Data for the question (text, etc.).
 * @property {AssignmentPostQuestionOptionResponse[]} options - Options for the question.
 */
export interface AssignmentPostQuestionResponse {
  id: string;
  questionType: string;
  questionData: string;
  options: AssignmentPostQuestionOptionResponse[];
}

/**
 * Interface representing an option for assignment post question returned from API.
 * @property {string} id - Unique identifier of the option (GUID).
 * @property {string} text - Option text.
 */
export interface AssignmentPostQuestionOptionResponse {
  id: string;
  text: string;
}

/**
 * Interface representing file info for a material post.
 * @property {string} fileName - Name of the file.
 * @property {number} fileSize - Size of the file in bytes.
 * @property {string} downloadUrl - URL for downloading the file.
 */
export interface PostFileInfoResponse {
  fileName: string;
  fileSize: number;
  downloadUrl: string;
}
