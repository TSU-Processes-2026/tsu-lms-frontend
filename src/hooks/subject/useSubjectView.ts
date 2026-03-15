import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSubjectFeed, UseSubjectFeed } from '@/hooks/subject/useSubjectFeed';
import { useSubjects, Participant, ExtendedSubject } from '@/hooks/subject/useSubjects';
import { Subject } from '@/types/subject/Subject';
import { UserResponse } from '@/types/user/UserResponse';
import { Post, Assignment } from '@/types/subject/FeedTypes';
import { useProfile } from '@/hooks/profile/useProfile';

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
  handleEditPost: (post: Post) => void;
  handleOpenAssignment: (assignment: Assignment) => void;
};

/**
 * useSubjectView hook manages business logic for SubjectView page.
 *
 * This hook provides state and handlers for:
 * - Modal windows (students and assignment modals)
 * - Tab switching (feed/students)
 * - Subject business logic (subjectId, feed, subject info, participants)
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

  const handleOpenAssignment = () => {
    // Здесь логика открытия задания
    // ...
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
    handleOpenAssignment,
  };
}
