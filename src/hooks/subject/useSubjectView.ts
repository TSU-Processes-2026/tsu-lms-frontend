import { useState } from 'react';

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
 */
export type UseSubjectView = {
  showModal: boolean;
  showAssignmentModal: boolean;
  activeTab: 'feed' | 'students';
  handleShowModal: () => void;
  handleCloseModal: () => void;
  handleShowAssignmentModal: () => void;
  handleCloseAssignmentModal: () => void;
  setActiveTab: (tab: 'feed' | 'students') => void;
};

/**
 * useSubjectView hook manages business logic for SubjectView page.
 *
 * This hook provides state and handlers for:
 * - Modal windows (students and assignment modals)
 * - Tab switching (feed/students)
 *
 * @returns {Object} State and handlers for SubjectView business logic.
 * @property {boolean} showModal - Whether the students modal is open.
 * @property {boolean} showAssignmentModal - Whether the assignment modal is open.
 * @property {'feed' | 'students'} activeTab - Current active tab.
 * @property {function} handleShowModal - Opens the students modal.
 * @property {function} handleCloseModal - Closes the students modal.
 * @property {function} handleShowAssignmentModal - Opens the assignment modal.
 * @property {function} handleCloseAssignmentModal - Closes the assignment modal.
 * @property {function} setActiveTab - Sets the active tab.
 */
export function useSubjectView(): UseSubjectView {
  const [showModal, setShowModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'students'>('feed');

  /**
   * Opens the students modal.
   */
  const handleShowModal = () => setShowModal(true);

  /**
   * Closes the students modal.
   */
  const handleCloseModal = () => setShowModal(false);

  /**
   * Opens the assignment modal.
   */
  const handleShowAssignmentModal = () => setShowAssignmentModal(true);

  /**
   * Closes the assignment modal.
   */
  const handleCloseAssignmentModal = () => setShowAssignmentModal(false);

  return {
    showModal,
    showAssignmentModal,
    activeTab,
    handleShowModal,
    handleCloseModal,
    handleShowAssignmentModal,
    handleCloseAssignmentModal,
    setActiveTab,
  };
}
