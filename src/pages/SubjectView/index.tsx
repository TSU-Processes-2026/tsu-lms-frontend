import { useSubjectView, UseSubjectViewResult } from '@/hooks/subject/useSubjectView.ts';
import React, { useState, useRef } from 'react';
import StudentsModal from '@/components/modals/StudentsModal';
import CreateAssignmentModal from '@/components/modals/CreateAssignmentModal';
import { User as UserIcon, Upload, ClipboardCheck, Users } from 'lucide-react';
import AnnouncementPostCard from '@/components/ui/AnnouncementPostCard';
import MaterialPostCard from '@/components/ui/MaterialPostCard';
import AssignmentPostCard from '@/components/ui/AssignmentPostCard';
import { PostResponse, AnnouncementPostResponse, MaterialPostResponse, AssignmentPostResponse } from '@/types/subject/FeedTypes';

const SubjectView = () => {
    const [publishError, setPublishError] = useState<string | null>(null);
    const {
        showModal,
        showAssignmentModal,
        activeTab,
        handleShowModal,
        handleCloseModal,
        handleCloseAssignmentModal,
        setActiveTab,
        feed,
        subjectCode,
        subjectParticipants,
        userRole,
        profile,
        handleEditPost,
        composerText,
        setComposerText,
        handlePublish,
    }: UseSubjectViewResult = useSubjectView();

    const [file, setFile] = useState<File | null>(null);
    const [fileLoading, setFileLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handles file selection and upload with progress tracking.
     *
     * @param e - React change event from file input.
     * @throws May throw network errors during upload.
     *
     * This function initiates file upload via XMLHttpRequest,
     * tracks progress and updates fileUploadProgress state.
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

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="flex border-b border-slate-200 mb-8 bg-white/60 backdrop-blur-sm rounded-t-3xl px-2 pt-2">
                    <button
                        className={`px-6 py-3 font-semibold transition-all rounded-t-2xl ${activeTab === 'feed' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('feed')}
                    >
                        Лента
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-all rounded-t-2xl ${activeTab === 'students' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('students')}
                    >
                        Студенты
                    </button>
                </div>
                {activeTab === 'feed' && (
                    <div className="space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-100">
                            <div className="flex gap-4">
                                <div className="w-11 h-11 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                                    <UserIcon size={22} className="text-white" />
                                </div>
                                <textarea
                                    className="w-full resize-none border-none bg-transparent p-2 text-slate-700 focus:ring-0 outline-none placeholder:text-slate-400"
                                    placeholder="Поделиться объявлением..."
                                    rows={2}
                                    value={composerText}
                                    onChange={e => setComposerText(e.target.value)}
                                />
                            </div>

                            {fileLoading && null}
                            {file && !fileLoading && (
                                <div className="mt-3 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                                    <span className="text-slate-700 text-sm font-medium">{file.name}</span>
                                    <button
                                        className="text-red-500 text-xs font-semibold hover:underline"
                                        onClick={handleRemoveFile}
                                    >Удалить файл</button>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center gap-2 text-sm font-semibold transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={18} /> Файл
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        className="px-4 py-2 hover:bg-purple-50 rounded-xl text-purple-600 flex items-center gap-2 text-sm font-semibold transition-all"
                                        onClick={handleCloseAssignmentModal}
                                    >
                                        <ClipboardCheck size={18} /> Задание
                                    </button>
                                </div>
                                <button
                                    className={
                                        `bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-blue-200/50 transition-all
                                        ${fileLoading || (!file && !composerText.trim()) ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : 'hover:-translate-y-0.5'}`
                                    }
                                    onClick={async (e) => {
                                        if (fileLoading || (!file && !composerText.trim())) {
                                            e.preventDefault();
                                            return;
                                        }
                                        setPublishError(null);
                                        try {
                                            await handlePublish(file ? 'Material' : 'Announcement', composerText, file);
                                            setFile(null);
                                            setPublishError(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        } catch {
                                            setPublishError('Ошибка публикации поста');
                                        }
                                    }}
                                    disabled={fileLoading || (!file && !composerText.trim())}
                                >
                                    Опубликовать
                                </button>
                                {publishError && (
                                    <div className="text-red-500 text-xs mt-2">{publishError}</div>
                                )}
                            </div>
                        </div>
                        {feed.loading && <div className="text-center text-slate-400">Загрузка...</div>}
                        {feed.error && <div className="text-center text-red-500">{feed.error}</div>}
                        {(feed.posts as PostResponse[]).map((post: PostResponse) => {
                            const normalizedType = post.postType.toLowerCase();
                            switch (normalizedType) {
                                case 'announcement':
                                    return (
                                        <AnnouncementPostCard
                                            key={post.id}
                                            post={post as AnnouncementPostResponse}
                                            userId={profile.id}
                                            userRole={userRole}
                                            onEditPost={handleEditPost}
                                        />
                                    );
                                case 'material':
                                    return (
                                        <MaterialPostCard
                                            key={post.id}
                                            post={post as MaterialPostResponse}
                                        />
                                    );
                                case 'assignment': {
                                    const assignmentPost = post as AssignmentPostResponse;
                                    return (
                                        <AssignmentPostCard
                                            key={assignmentPost.id}
                                            post={assignmentPost}
                                            assignment={{
                                                id: assignmentPost.id,
                                                subjectId: assignmentPost.subjectId,
                                                authorId: assignmentPost.authorId,
                                                postType: assignmentPost.postType,
                                                content: assignmentPost.content,
                                                createdAt: assignmentPost.createdAt,
                                                assignmentData: assignmentPost.assignmentData,
                                                questions: assignmentPost.questions,
                                            }}
                                            onOpenAssignment={() => {}} //TODO: добавить открытие теста
                                        />
                                    );
                                }
                                default:
                                    return <div key={post.id} className="text-slate-400">Неизвестный тип поста</div>;
                            }
                        })}
                    </div>
                )}
                {activeTab === 'students' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-slate-100 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={36} className="text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Участники предмета</h4>
                        <p className="text-slate-500 mb-2">Всего участников: <span className="font-bold text-slate-700">{subjectParticipants}</span></p>
                        <p className="text-xs text-slate-400 font-mono mb-8">Код предмета: {subjectCode}</p>
                        <button className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all" onClick={handleShowModal}>
                            Управление участниками
                        </button>
                    </div>
                )}
            </div>
            {showModal && <StudentsModal onClose={handleCloseModal} />}
            {showAssignmentModal && <CreateAssignmentModal onClose={handleCloseAssignmentModal} />}
        </>
    );
};

export default SubjectView;
