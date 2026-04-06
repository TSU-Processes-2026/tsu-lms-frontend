import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSubjectFeed, UseSubjectFeed } from '@/hooks/subject/useSubjectFeed';
import { useSubjects, Participant, ExtendedSubject } from '@/hooks/subject/useSubjects';
import { Subject } from '@/types/subject/Subject';
import { UserResponse } from '@/types/user/UserResponse';
import { PostResponse, CommentResponse, AssignmentResponse } from '@/types/subject/FeedTypes';
import { useProfile } from '@/hooks/profile/useProfile';
import { CommentItem } from '@/components/ui/CommentSection.tsx';
import { addPostComment, downloadPostFile, fetchPostComments } from '@/api/subject/subjectView';
import React, { useState } from 'react';

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
 * @property {() => void} handleDownloadFile - Handler for downloading a file.
 * @property {(authorId: string) => string} getAuthorUsername - Gets the username by authorId.
 * @property {function} handlePublish - Publishes a post (announcement or material).
 * @property {File | null} file - Selected file for post.
 * @property {boolean} fileLoading - Loading state for file upload.
 * @property {React.RefObject<HTMLInputElement | null>} fileInputRef - Ref for file input.
 * @property {function} handleFileChange - Handler for file input change.
 * @property {function} handleRemoveFile - Handler for removing selected file.
 * @property {string | null} publishError - Error message for post publishing.
 * @property {function} setPublishError - Setter for publishError.
 */
export type UseSubjectViewResult = {
    showModal: boolean;
    showAssignmentModal: boolean;
    showCommandConfig: boolean;
    activeTab: 'feed' | 'students' | 'commands' | string;
    handleActiveTab: (tab: 'feed' | 'students' | 'commands' | string) => void;
    handleShowModal: () => void;
    handleCloseModal: () => void;
    handleShowAssignmentModal: () => void;
    handleCloseAssignmentModal: () => void;
    setActiveTab: (tab: 'feed' | 'students' | 'commands') => void;
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
    setShowConfig: (state: boolean) => void;
    setComposerText: (text: string) => void;
    /**
     * Downloads a file for a material post and triggers browser download.
     *
     * @param {string} postId - The ID of the post to download file from.
     * @param {string} fileName - The name for the downloaded file.
     * @throws {Error} If download fails.
     * @returns {Promise<void>} Promise resolving when download is complete.
     */
    handleDownloadFile: (postId: string, fileName: string) => Promise<void>;
    /**
     * Returns the username for a given authorId for the current subject.
     *
     * @param {string} authorId - The userId of the author.
     * @returns {string} Username if found, otherwise authorId.
     *
     * @throws {Error} If participants data is unavailable.
     */
    getAuthorUsername: (authorId: string) => string;
    /**
     * Fetches comments for a given postId and updates state.
     *
     * @param {string} postId - Post identifier.
     * @returns {Promise<void>} Promise resolving when comments are loaded.
     * @throws {Error} If loading fails.
     */
    fetchComments: (postId: string) => Promise<void>;
    /**
     * Adds a new comment to a post and updates state.
     *
     * @param {string} postId - Post identifier.
     * @returns {Promise<void>} Promise resolving when comment is added.
     * @throws {Error} If adding fails.
     */
    addComment: (postId: string) => Promise<void>;
    commentsByPostId: Record<string, CommentItem[]>;
    loadingByPostId: Record<string, boolean>;
    errorByPostId: Record<string, string | null>;
    /**
     * Publishes a post (announcement or material).
     *
     * @param {string} postType - Type of the post (announcement or material).
     * @param {string} content - Content of the post.
     * @param {File | null} file - Optional file for the post.
     * @returns {Promise<void>} Promise resolving when post is published.
     * @throws {Error} If publishing fails.
     */
    handlePublish: (postType: string, content: string, file?: File | null) => Promise<void>;
    file: File | null;
    fileLoading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveFile: () => void;
    publishError: string | null;
    setPublishError: (error: string | null) => void;
    getShowEditButton: (post: PostResponse, userId: string, userRole: string) => boolean;
    /**
     * Handles opening assignment test for a given assignment object.
     *
     * @param {AssignmentResponse} assignment - Assignment object to open.
     * @throws {Error} If opening fails.
     * @returns {void}
     */
    handleOpenAssignment: (assignment: AssignmentResponse) => void;
    /**
     * Handles creation of assignment and assignment post.
     * Calls publishAssignmentPost and createAssignment, updates feed.
     * @param assignment - assignment object from modal form
     */
    handleCreateAssignment: (assignment: {
        id: string;
        title: string;
        questions: import('@/hooks/subject/useCreateAssignmentModal').QuestionType[];
        subjectId: string;
        type: string;
        status: string;
        subject: string;
    }) => Promise<void>;
    refreshFeed: () => Promise<void>;
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
    const navigate = useNavigate();
    const handleOpenAssignment = (assignment: AssignmentResponse): void => {
        localStorage.setItem('openAssignmentId', assignment.id);
        navigate('/assignments');
    };
    const { profile } = useProfile();
    const [searchParams, setSearchParams] = useSearchParams();
    const [file, setFile] = useState<File | null>(null);
    const [fileLoading, setFileLoading] = useState<boolean>(false);
    const fileInputRef: React.RefObject<HTMLInputElement | null> = React.createRef();
    const [publishError, setPublishError] = useState<string | null>(null);

    const [showCommandConfig, setShowConfig] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'feed' | 'students' | 'commands' | string>(
        searchParams.get('tab') || 'feed',
    );

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleShowAssignmentModal = () => setShowAssignmentModal(true);
    const handleCloseAssignmentModal = () => setShowAssignmentModal(false);
    const handleActiveTab = (tab: 'feed' | 'students' | 'commands' | string) => {
        setSearchParams({ tab: tab });
        setActiveTab(tab);
    };

    const { subjectId } = useParams();
    const feed = useSubjectFeed(subjectId ?? '');
    const { selectedSubject, participants, subjects, selectSubject } = useSubjects();
    const subjectCode = selectedSubject && 'code' in selectedSubject ? selectedSubject.code : '';
    const subjectParticipants =
        subjectId && participants[subjectId] ? participants[subjectId].length : 0;

    let userRole: 'admin' | 'teacher' | 'student' = 'student';
    if (subjectId && participants[subjectId] && profile.id) {
        const found = participants[subjectId].find((p) => p.userId === profile.id);
        if (found && found.role) {
            userRole = found.role;
        }
    }

    const handleEditPost = () => {
        // Здесь логика редактирования поста
        // ...
    };

    const [composerText, setComposerText] = useState<string>('');

    const [commentsByPostId, setCommentsByPostId] = useState<Record<string, CommentItem[]>>({});
    const [loadingByPostId, setLoadingByPostId] = useState<Record<string, boolean>>({});
    const [errorByPostId, setErrorByPostId] = useState<Record<string, string | null>>({});

    /**
     * Fetches comments for a given postId and updates state.
     *
     * @param {string} postId - Post identifier.
     * @returns {Promise<void>} Promise resolving when comments are loaded.
     * @throws {Error} If loading fails.
     */
    const fetchComments = React.useCallback(async (postId: string): Promise<void> => {
        setLoadingByPostId((prev: Record<string, boolean>) => ({ ...prev, [postId]: true }));
        setErrorByPostId((prev: Record<string, string | null>) => ({ ...prev, [postId]: null }));
        try {
            const data: CommentResponse[] = await fetchPostComments(postId);
            setCommentsByPostId((prev: Record<string, CommentItem[]>) => ({
                ...prev,
                [postId]: data.map((c: CommentResponse) => ({
                    id: c.id,
                    author: c.authorId,
                    text: c.text,
                    date: c.createdAt,
                })),
            }));
            setLoadingByPostId((prev: Record<string, boolean>) => ({ ...prev, [postId]: false }));
        } catch {
            setErrorByPostId((prev: Record<string, string | null>) => ({
                ...prev,
                [postId]: 'Ошибка загрузки комментариев',
            }));
            setLoadingByPostId((prev: Record<string, boolean>) => ({ ...prev, [postId]: false }));
        }
    }, []);

    /**
     * Adds a new comment to a post and updates state.
     *
     * @param {string} postId - Post identifier.
     * @returns {Promise<void>} Promise resolving when comment is added.
     * @throws {Error} If adding fails.
     */
    const addComment = async (postId: string): Promise<void> => {
        if (!composerText.trim()) return;
        try {
            const response = await addPostComment(postId, composerText);
            setCommentsByPostId((prev: Record<string, CommentItem[]>) => ({
                ...prev,
                [postId]: [
                    ...(prev[postId] || []),
                    {
                        id: response.id,
                        author: response.authorId,
                        text: response.text,
                        date: response.createdAt,
                    },
                ],
            }));
            setComposerText('');
        } catch {
            setErrorByPostId((prev: Record<string, string | null>) => ({
                ...prev,
                [postId]: 'Ошибка добавления комментария',
            }));
        }
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

    /**
     * Returns the username for a given authorId for the current subject.
     *
     * @param {string} authorId - The userId of the author.
     * @returns {string} Username if found, otherwise authorId.
     *
     * @throws {Error} If participants data is unavailable.
     */
    const getAuthorUsername = (authorId: string): string => {
        if (!subjectId || !participants[subjectId]) return authorId;
        const found = participants[subjectId].find(
            (p: { userId: string; username: string }) => p.userId === authorId,
        );
        return found ? found.username : authorId;
    };

    /**
     * Handles file input change event.
     *
     * @param e React.ChangeEvent<HTMLInputElement> - File input change event.
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files && e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    /**
     * Removes the selected file from state.
     */
    const handleRemoveFile = () => {
        setFile(null);
    };

    /**
     * Publishes a post (announcement or material).
     *
     * @param {string} postType - Type of the post (announcement or material).
     * @param {string} content - Content of the post.
     * @param {File | null} file - Optional file for the post.
     * @returns {Promise<void>} Promise resolving when post is published.
     * @throws {Error} If publishing fails.
     */
    /**
     * Publishes a post (announcement or material).
     *
     * @param {string} postType - Type of the post (announcement or material).
     * @param {string} content - Content of the post.
     * @param {File | null} file - Optional file for the post.
     * @returns {Promise<void>} Promise resolving when post is published.
     * @throws {Error} If publishing fails.
     */
    const handlePublish = async (
        postType: string,
        content: string,
        file?: File | null,
    ): Promise<void> => {
        setFileLoading(true);
        setPublishError(null);
        try {
            if (!subjectId) throw new Error('SubjectId is required');
            await feed.publishPost({
                PostType: postType,
                Content: content,
                File: file || undefined,
            });
            setFile(null);
        } catch {
            setPublishError('Ошибка публикации поста');
        } finally {
            setFileLoading(false);
        }
    };

    /**
     * Determines whether the edit button should be shown for a post.
     *
     * @param post Announcement post object.
     * @param userId Current user's ID.
     * @param userRole Current user's role.
     * @returns {boolean} True if edit button should be shown, otherwise false.
     */
    const getShowEditButton = (post: PostResponse, userId: string, userRole: string): boolean => {
        return userRole === 'admin' || userRole === 'teacher' || post.authorId === userId;
    };

    /**
     * Handles creation of assignment and assignment post.
     * Calls publishAssignmentPost and createAssignment, updates feed.
     * @param type
     */
    const mapQuestionType = (
        type: 'single' | 'multiple' | 'input',
    ): import('@/types/subject/AssignmentCreate').AssignmentQuestionType => {
        if (type === 'single') return 'SingleChoice';
        if (type === 'multiple') return 'MultipleChoice';
        return 'Text';
    };
    const handleCreateAssignment = async (assignment: {
        id: string;
        title: string;
        questions: import('@/hooks/subject/useCreateAssignmentModal').QuestionType[];
        subjectId: string;
        type: string;
        status: string;
        subject: string;
    }) => {
        if (!subjectId) return;
        setPublishError(null);
        try {
            const upsertAssignment: import('@/types/subject/AssignmentCreate').UpsertAssignmentRequest =
                {
                    content: assignment.title,
                    questions: assignment.questions.map((q) => ({
                        questionType: mapQuestionType(q.type),
                        questionData: q.text,
                        options: q.options
                            ? q.options.map((opt: string) => ({ text: opt }))
                            : undefined,
                    })),
                };
            await import('@/api/subject/subjectView').then((api) =>
                api.createAssignment(subjectId, upsertAssignment),
            );
            handleCloseAssignmentModal();
            await feed.refreshFeed();
        } catch {
            setPublishError('Ошибка создания теста');
        }
    };

    React.useEffect(() => {
        if (
            subjectId &&
            (!selectedSubject || selectedSubject.id !== subjectId) &&
            subjects &&
            subjects.length > 0 &&
            selectSubject
        ) {
            const found = subjects.find((s) => s.id === subjectId);
            if (found) {
                selectSubject(found);
            }
        }
    }, [subjectId, selectedSubject, subjects, selectSubject]);

    return {
        handleOpenAssignment,
        showModal,
        showAssignmentModal,
        showCommandConfig,
        activeTab,
        handleShowModal,
        handleCloseModal,
        handleShowAssignmentModal,
        handleCloseAssignmentModal,
        setActiveTab,
        handleActiveTab,
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
        handleDownloadFile,
        getAuthorUsername,
        fetchComments,
        addComment,
        commentsByPostId,
        loadingByPostId,
        errorByPostId,
        handlePublish,
        file,
        fileLoading,
        fileInputRef,
        handleFileChange,
        handleRemoveFile,
        publishError,
        setPublishError,
        setShowConfig,
        getShowEditButton,
        handleCreateAssignment,
        refreshFeed: feed.refreshFeed,
    };
}
