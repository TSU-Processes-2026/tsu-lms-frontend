import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSubjectFeed, UseSubjectFeed } from '@/hooks/subject/useSubjectFeed';
import { useSubjects, Participant, ExtendedSubject } from '@/hooks/subject/useSubjects';
import { Subject } from '@/types/subject/Subject';
import { UserResponse } from '@/types/user/UserResponse';
import { PostResponse } from '@/types/subject/FeedTypes';
import { useProfile } from '@/hooks/profile/useProfile';
import { CommentItem } from "@/components/ui/CommentSection.tsx";
import { addPostComment, downloadPostFile } from '@/api/subject/subjectView';

/**
 * useSubjectView hook return type.
 *
 * @property {boolean} showModal - Whether the students modal is open.
 * @property {boolean} showAssignmentModal - Whether the assignment modal is open.
 * @property {'feed' | 'students'} activeTab - Current active tab.
 * @property {() => void} handleShowModal - Opens the students modal.
 * @property {() => void} handleCloseModal - Closes the students modal.
 * @property {() => void} handleShowAssignmentModal - Opens the assignment modal.
 * @property {() => void} handleCloseAssignmentModal - Closes the assignment modal.
 * @property {(tab: 'feed' | 'students') => void} setActiveTab - Sets the active tab.
 * @property {string | undefined} subjectId - Subject identifier from route params.
 * @property {UseSubjectFeed} feed - Feed state and handlers.
 * @property {Subject | ExtendedSubject | null} selectedSubject - Currently selected subject.
 * @property {Record<string, Participant[]>} participants - Participants grouped by subjectId.
 * @property {string} subjectCode - Subject code (empty string if not found).
 * @property {number} subjectParticipants - Number of participants for the subject.
 * @property {string} userRole - User role in the subject.
 * @property {UserResponse} profile - Current user profile.
 * @property {(post: PostResponse) => void} handleEditPost - Handler for editing a post.
 * @property {string} composerText - Current value of comment composer input.
 * @property {(text: string) => void} setComposerText - Handler to set composer text.
 * @property {CommentItem[]} comments - Array of comments.
 * @property {() => void} handleComment - Handler for adding a new comment.
 * @property {() => void} handlePublish - Handler for publishing a post.
 * @property {File | null} file - Selected file for material post.
 * @property {boolean} fileLoading - File upload loading state.
 * @property {React.RefObject<HTMLInputElement | null>} fileInputRef - Ref for file input.
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} handleFileChange - Handler for file selection/upload.
 * @property {() => void} handleRemoveFile - Handler for removing selected file.
 * @property {string | null} publishError - Error message for publishing post.
 * @property {(error: string | null) => void} setPublishError - Setter for publish error.
 * @property {() => void} handleDownloadFile - Handler for downloading a file.
 */
export type UseSubjectViewResult = {
  showModal: boolean;
  showAssignmentModal: boolean;
  activeTab: 'feed' | 'students';
  handleShowModal: () => void;
  handleCloseModal: () => void;
  handleShowAssignmentModal: () => void;
  handleCloseAssignmentModal: () => void;
  setActiveTab: (tab: 'feed' | 'students') => void;
  subjectId?: string;
  feed: UseSubjectFeed;
  selectedSubject: Subject | ExtendedSubject | null;
  participants: Record<string, Participant[]>;
  subjectCode: string;
  subjectParticipants: number;
  userRole: string;
  profile: UserResponse;
  handleEditPost: (post: PostResponse) => void;
  composerText: string;
  setComposerText: (text: string) => void;
  comments: CommentItem[];
  handleComment: (postId: string) => Promise<void>;
  /**
   * Handler for publishing a post from the composer.
   * @param {string} postType - Type of the post ('announcement' | 'material').
   * @param {string} composerText - Content of the post.
   * @param {File | null} file - Optional file for material post.
   * @returns {Promise<void>} Promise resolving when post is published.
   */
  handlePublish: (postType: 'Announcement' | 'Material', composerText: string, file: File | null) => Promise<void>;
  file: File | null;
  fileLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  publishError: string | null;
  setPublishError: (error: string | null) => void;
  /**
   * Downloads a file for a material post and triggers browser download.
   *
   * @param {string} postId - The ID of the post to download file from.
   * @param {string} fileName - The name for the downloaded file.
   * @throws {Error} If download fails.
   * @returns {Promise<void>} Promise resolving when download is complete.
   */
  handleDownloadFile: (postId: string, fileName: string) => Promise<void>;
};

/**
 * useSubjectView hook manages business logic for SubjectView page.
 *
 * This hook provides state and handlers for:
 * - Modal windows (students and assignment modals)
 * - Tab switching (feed/students)
 * - Subject business logic (subjectId, feed, subject info, participants)
 * - Comments section logic (composerText, setComposerText, comments, handleComment)
 *
 * @returns {UseSubjectViewResult} State and business logic for SubjectView.
 * @throws {Error} If fetching subject data fails.
 */
export function useSubjectView(): UseSubjectViewResult {
  const { profile } = useProfile();

  const [showModal, setShowModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'students'>('feed');

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowAssignmentModal = () => setShowAssignmentModal(true);
  const handleCloseAssignmentModal = () => setShowAssignmentModal(false);

  const { subjectId } = useParams();
  const feed = useSubjectFeed(subjectId ?? '');
  const { selectedSubject, participants } = useSubjects();
  const subjectCode = selectedSubject && 'code' in selectedSubject ? selectedSubject.code : '';
  const subjectParticipants = subjectId && participants[subjectId] ? participants[subjectId].length : 0;

  let userRole: 'admin' | 'teacher' | 'student' = 'student';
  if (subjectId && participants[subjectId] && profile.id) {
    const found = participants[subjectId].find(p => p.userId === profile.id);
    if (found && found.role) {
      userRole = found.role;
    }
  }

  const handleEditPost = () => {
    // Здесь логика редактирования поста
    // ...
  };

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [composerText, setComposerText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  /**
   * Adds a new comment to the comments array and saves it to API.
   * Ignores empty input.
   * @param {string} postId - Post identifier.
   * @throws Does not throw.
   * @returns void
   */
  const handleComment = async (postId: string) => {
    if (!composerText.trim()) return;
    try {
      const response = await addPostComment(postId, composerText);
      setComments([
        ...comments,
        {
          id: response.id,
          author: response.authorId,
          text: response.text,
          date: response.createdAt,
        },
      ]);
      setComposerText('');
    } catch {
      // Ошибка при сохранении комментария
      // Можно добавить обработку ошибки
    }
  };

  /**
   * Handler for publishing a post from the composer.
   * Calls feed.publishPost and resets composerText.
   * Ignores empty input.
   * @param {string} postType - Type of the post ('announcement' | 'material').
   * @param {string} composerText - Content of the post.
   * @param {File | null} file - Optional file for material post.
   * @throws Does not throw.
   * @returns void
   */
  const handlePublish = async (
    postType: 'Announcement' | 'Material',
    composerText: string,
    file: File | null
  ) => {
    if (postType === 'Material' && !file) {
        throw new Error('Для публикации материала необходимо выбрать файл');
    }
    if (postType === 'Announcement' && !composerText.trim()) {
        throw new Error('Для публикации объявления необходимо ввести описание');
    }
    try {
      await feed.publishPost({ PostType: postType, Content: composerText, File: file ?? undefined });
      setComposerText('');
    } catch {
      // Ошибка публикации поста
      // Можно добавить обработку ошибки
    }
  };

  /**
   * Handles file selection and upload with progress tracking.
   *
   * @param e - React change event from file input.
   * @throws May throw network errors during upload.
   *
   * This function initiates file upload via XMLHttpRequest,
   * tracks progress and updates fileLoading state.
   * The fileLoading state ensures the publish button is disabled
   * until upload is complete.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;
    setFileLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.onload = () => {
      setFile(selectedFile);
      setFileLoading(false);
    };
    xhr.onerror = () => {
      setFileLoading(false);
    };
    xhr.send(formData);
  };

  /**
   * Removes the selected file and resets file input value.
   *
   * @returns void
   */
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Downloads a file for a material post and triggers browser download.
   *
   * @param {string} postId - The ID of the post to download file from.
   * @param {string} fileName - The name for the downloaded file.
   * @throws {Error} If download fails.
   * @returns {Promise<void>} Promise resolving when download is complete.
   */
  const handleDownloadFile = async (postId: string, fileName: string): Promise<void> => {
    try {
      const blob = await downloadPostFile(postId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Не удалось скачать файл');
    }
  };

  return {
    showModal,
    showAssignmentModal,
    activeTab,
    handleShowModal,
    handleCloseModal,
    handleShowAssignmentModal,
    handleCloseAssignmentModal,
    setActiveTab,
    subjectId,
    feed,
    selectedSubject,
    participants,
    subjectCode,
    subjectParticipants,
    userRole,
    profile,
    handleEditPost,
    composerText,
    setComposerText,
    comments,
    handleComment,
    handlePublish,
    file,
    fileLoading,
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
    publishError,
    setPublishError,
    handleDownloadFile,
  };
}
