import { useSubjectView } from '@/hooks/subject/useSubjectView';
import StudentsModal from '@/components/modals/StudentsModal';
import CreateAssignmentModal from '@/components/modals/CreateAssignmentModal';
import { User as UserIcon, Upload, ClipboardCheck, Users, Settings } from 'lucide-react';
import AnnouncementPostCard from '@/components/ui/AnnouncementPostCard';
import MaterialPostCard from '@/components/ui/MaterialPostCard';
import AssignmentPostCard from '@/components/ui/AssignmentPostCard';
import {
    PostResponse,
    AnnouncementPostResponse,
    MaterialPostResponse,
    AssignmentPostResponse,
} from '@/types/subject/FeedTypes';
import { CommandConfiguration } from '@/components/modals/CommandConfiguration';
import { CommandCard } from '@/components/ui/CommandCard';
import { useCommandModal } from '@/hooks/command/useCommandModal';
import CommandParticipantsModal from '@/components/modals/ShowCommadParticipants';
import { useState } from 'react';
import { CommandParticipant } from '@/types/command/CommandParticipant';
import { Team } from '@/types/command/Team';

interface MaterialPostCardData extends MaterialPostResponse {
    authorUsername: string;
}

interface AssignmentPostCardData extends AssignmentPostResponse {
    authorUsername: string;
}

interface Command {
    id: string;
    participants: CommandParticipant[];
}

const commandsMock: Team[] = [
    {
        id: '1',
        subjectId: '1',
        memberIds: ['123', '123', '123', '123'],
    },
    {
        id: '2',
        subjectId: '2',
        memberIds: ['123', '123', '123', '123', '123', '123'],
    },
    {
        id: '3',
        subjectId: '3',
        memberIds: ['123', '123', '123', '123', '123', '123'],
    },
];

const SubjectView = () => {
    const {
        showModal,
        showAssignmentModal,
        activeTab,
        handleShowModal,
        handleCloseModal,
        handleShowAssignmentModal,
        handleCloseAssignmentModal,
        setActiveTab,
        feed,
        subjectId,
        subjectCode,
        subjectParticipants,
        showCommandConfig,
        userRole,
        profile,
        handleEditPost,
        composerText,
        setComposerText,
        handlePublish,
        file,
        fileLoading,
        fileInputRef,
        handleFileChange,
        handleRemoveFile,
        publishError,
        setPublishError,
        setShowConfig,
        getAuthorUsername,
        getShowEditButton,
        handleCreateAssignment,
        selectedSubject,
    } = useSubjectView();

    const [selectedCommand, setSelectedCommand] = useState<string>('');
    const {
        showCommandParticipants,
        handleCloseCommandParticipants,
        handleShowCommandParticipants,
    } = useCommandModal();

    const handleSelectCommand = (id: string) => {
        setSelectedCommand(id);
        handleShowCommandParticipants();
    };

    return (
        <>
            <div className='max-w-4xl mx-auto'>
                <div className='flex border-b border-slate-200 mb-8 bg-white/60 backdrop-blur-sm rounded-t-3xl px-2 pt-2'>
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
                    <button
                        className={`px-6 py-3 font-semibold transition-all rounded-t-2xl ${activeTab === 'commands' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('commands')}
                    >
                        Команды
                    </button>
                </div>
                {activeTab === 'feed' && (
                    <div className='space-y-6'>
                        <div className='bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-100'>
                            <div className='flex gap-4'>
                                <div className='w-11 h-11 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg'>
                                    <UserIcon size={22} className='text-white' />
                                </div>
                                <textarea
                                    className='w-full resize-none border-none bg-transparent p-2 text-slate-700 focus:ring-0 outline-none placeholder:text-slate-400'
                                    placeholder='Поделиться объявлением...'
                                    rows={2}
                                    value={composerText}
                                    onChange={(e) => setComposerText(e.target.value)}
                                />
                            </div>

                            {fileLoading && null}
                            {file && !fileLoading && (
                                <div className='mt-3 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2'>
                                    <span className='text-slate-700 text-sm font-medium'>
                                        {file.name}
                                    </span>
                                    <button
                                        className='text-red-500 text-xs font-semibold hover:underline'
                                        onClick={handleRemoveFile}
                                    >
                                        Удалить файл
                                    </button>
                                </div>
                            )}
                            <div className='flex justify-between items-center mt-5 pt-4 border-t border-slate-100'>
                                <div className='flex gap-2'>
                                    <button
                                        className='px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center gap-2 text-sm font-semibold transition-all'
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={18} /> Файл
                                    </button>
                                    <input
                                        type='file'
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        className='px-4 py-2 hover:bg-purple-50 rounded-xl text-purple-600 flex items-center gap-2 text-sm font-semibold transition-all'
                                        onClick={handleShowAssignmentModal}
                                    >
                                        <ClipboardCheck size={18} /> Задание
                                    </button>
                                </div>
                                <button
                                    className={`bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-blue-200/50 transition-all
                                        ${fileLoading || (!file && !composerText.trim()) ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : 'hover:-translate-y-0.5'}`}
                                    onClick={async (e) => {
                                        if (fileLoading || (!file && !composerText.trim())) {
                                            e.preventDefault();
                                            return;
                                        }
                                        setPublishError(null);
                                        try {
                                            await handlePublish(
                                                file ? 'Material' : 'Announcement',
                                                composerText,
                                                file,
                                            );
                                            handleRemoveFile();
                                            setPublishError(null);
                                        } catch {
                                            setPublishError('Ошибка публикации поста');
                                        }
                                    }}
                                    disabled={fileLoading || (!file && !composerText.trim())}
                                >
                                    Опубликовать
                                </button>
                                {publishError && (
                                    <div className='text-red-500 text-xs mt-2'>{publishError}</div>
                                )}
                            </div>
                        </div>
                        {feed.loading && (
                            <div className='text-center text-slate-400'>Загрузка...</div>
                        )}
                        {feed.error && <div className='text-center text-red-500'>{feed.error}</div>}
                        {(feed.posts as PostResponse[]).map((post: PostResponse) => {
                            const normalizedType = post.postType.toLowerCase();
                            const authorUsername = getAuthorUsername(post.authorId);
                            const showEditButton = getShowEditButton(post, profile.id, userRole);
                            switch (normalizedType) {
                                case 'announcement':
                                    return (
                                        <AnnouncementPostCard
                                            key={post.id}
                                            post={
                                                {
                                                    ...post,
                                                    authorUsername,
                                                } as AnnouncementPostResponse
                                            }
                                            onEditPost={handleEditPost}
                                            showEditButton={showEditButton}
                                        />
                                    );
                                case 'material': {
                                    const materialPost = post as MaterialPostResponse;
                                    return (
                                        <MaterialPostCard
                                            key={materialPost.id}
                                            post={
                                                {
                                                    id: materialPost.id,
                                                    authorId: materialPost.authorId,
                                                    postType: materialPost.postType,
                                                    content: materialPost.content,
                                                    createdAt: materialPost.createdAt,
                                                    $type: materialPost.$type,
                                                    fileName: materialPost.fileName,
                                                    storagePath: materialPost.storagePath,
                                                    fileSize: materialPost.fileSize,
                                                    downloadUrl: materialPost.downloadUrl,
                                                    authorUsername,
                                                } as MaterialPostCardData
                                            }
                                        />
                                    );
                                }
                                case 'assignment': {
                                    const assignmentPost = post as AssignmentPostResponse;
                                    return (
                                        <AssignmentPostCard
                                            key={assignmentPost.id}
                                            post={
                                                {
                                                    id: assignmentPost.id,
                                                    subjectId: assignmentPost.subjectId,
                                                    authorId: assignmentPost.authorId,
                                                    postType: assignmentPost.postType,
                                                    content: assignmentPost.content,
                                                    createdAt: assignmentPost.createdAt,
                                                    $type: assignmentPost.$type,
                                                    assignmentData: assignmentPost.assignmentData,
                                                    questions: assignmentPost.questions,
                                                    authorUsername,
                                                } as AssignmentPostCardData
                                            }
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
                                        />
                                    );
                                }
                                default:
                                    return (
                                        <div key={post.id} className='text-slate-400'>
                                            Неизвестный тип поста
                                        </div>
                                    );
                            }
                        })}
                    </div>
                )}
                {activeTab === 'students' && (
                    <div className='bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg border border-slate-100 text-center'>
                        <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <Users size={36} className='text-blue-500' />
                        </div>
                        <h4 className='text-xl font-bold text-slate-800 mb-2'>
                            Участники предмета
                        </h4>
                        <p className='text-slate-500 mb-2'>
                            Всего участников:{' '}
                            <span className='font-bold text-slate-700'>{subjectParticipants}</span>
                        </p>
                        <p className='text-xs text-slate-400 font-mono mb-8'>
                            Код предмета: {subjectCode}
                        </p>
                        <button
                            className='bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all'
                            onClick={handleShowModal}
                        >
                            Управление участниками
                        </button>
                    </div>
                )}
                {activeTab === 'commands' && (
                    <>
                        <div className='flex flex-row items-center justify-between'>
                            <h3 className='text-3xl font-bold text-slate-800 mb-2'>
                                Список команд
                            </h3>
                            <Settings
                                size={40}
                                className='bg-linear-to-r from-blue-600 to-blue-700 text-white p-2 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all'
                                onClick={() => {
                                    setShowConfig(true);
                                }}
                            />
                        </div>

                        <ul className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4'>
                            {commandsMock.map((item, index) => (
                                <CommandCard
                                    index={index}
                                    participants={item.memberIds}
                                    onClick={() => handleSelectCommand(item.id)}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </div>
            {showModal && (
                <StudentsModal
                    onClose={handleCloseModal}
                    subjectId={subjectId ?? ''}
                    selectedSubject={selectedSubject ?? null}
                />
            )}
            {showCommandParticipants && (
                <CommandParticipantsModal
                    commandNumber={0}
                    onClose={handleCloseCommandParticipants}
                    currentUserId={''}
                    commandId={selectedCommand}
                />
            )}
            {showAssignmentModal && (
                <CreateAssignmentModal
                    subjectId={subjectId ?? ''}
                    onClose={handleCloseAssignmentModal}
                    onCreate={handleCreateAssignment}
                />
            )}
            {showCommandConfig && (
                <CommandConfiguration
                    onClose={() => {
                        setShowConfig(false);
                    }}
                />
            )}
        </>
    );
};

export default SubjectView;
