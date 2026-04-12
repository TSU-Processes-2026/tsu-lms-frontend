import { useSubjectView } from '@/hooks/subject/useSubjectView';
import StudentsModal from '@/components/modals/StudentsModal';
import CreateAssignmentModal from '@/components/modals/CreateAssignmentModal';
import {
    User as UserIcon,
    Upload,
    ClipboardCheck,
    Users,
    Settings,
    Plus,
    Dices,
    Brackets,
} from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { useLoadTeams } from '@/hooks/command/useLoadTeams';
import { CreateTeamManually } from '@/components/modals/CreateTeamManually';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useValidateTeams } from '@/hooks/command/useValidateTeams';
import { useGetProfile } from '@/hooks/profile/useProfile';
import { Team } from '@/types/command/Team';
import { useLoadConfig } from '@/hooks/command/useCommandConfig';
import { useConfirmation } from '@/hooks/command/useConfirmDistribution';
import { errorMessageMapper, warningMessageMapper } from '@/utils/messageMapper';
import { useDelayedLoader } from '@/hooks/loader/useLoader';

interface MaterialPostCardData extends MaterialPostResponse {
    authorUsername: string;
}

interface AssignmentPostCardData extends AssignmentPostResponse {
    authorUsername: string;
}

const SubjectView = () => {
    const {
        showModal,
        showAssignmentModal,
        activeTab,
        handleShowModal,
        handleCloseModal,
        handleShowAssignmentModal,
        handleCloseAssignmentModal,
        handleActiveTab,
        feed,
        subjectId,
        subjectCode,
        subjectParticipants,
        showCommandConfig,
        participants,
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
    const { profile } = useGetProfile();
    const [selectedCommand, setSelectedCommand] = useState<string>('1');
    const [selectedCommandIndex, setSelectedCommandIndex] = useState<number>(0);
    const {
        showCommandParticipants,
        handleCloseCommandParticipants,
        handleShowCommandParticipants,
    } = useCommandModal();

    const handleSelectCommand = (id: string, index: number) => {
        setSelectedCommand(id);
        setSelectedCommandIndex(index);
        handleShowCommandParticipants();
    };
    const [showCreateTeamManuallyModal, setShowCreateTeamManually] = useState<boolean>(false);
    const count =
        (subjectId &&
            participants[subjectId] &&
            participants[subjectId].filter(
                (member) => member.role?.toLocaleLowerCase() === 'student',
            ).length) ||
        0;
    const handleRole = (): 'admin' | 'teacher' | 'student' => {
        if (subjectId && participants[subjectId] && profile.id) {
            const found = participants[subjectId].find((p) => p.userId === profile.id);
            const normalizedRole = found?.role?.toLocaleLowerCase();
            if (
                normalizedRole === 'admin' ||
                normalizedRole === 'teacher' ||
                normalizedRole === 'student'
            ) {
                return normalizedRole;
            }
            return 'student';
        }
        return 'student';
    };
    const userRole: 'admin' | 'teacher' | 'student' = handleRole();
    const navigate = useNavigate();
    const { teams, loadedDistributionMode, isTeamLoading, setTeams } = useLoadTeams(subjectId);
    const {
        config,
        isConfigLoading,
        errorMessage: configError,
        setConfig,
    } = useLoadConfig(subjectId ?? '', userRole);

    const { showLoader } = useDelayedLoader(isConfigLoading);

    const { details, handleValidateTeams, handleErrorMessages, handleWarningMessages } =
        useValidateTeams();
    const { confirmation, validationDetails, handleFinalize } = useConfirmation(subjectId ?? '');
    const finalize = async () => {
        handleFinalize();
        if (confirmation) {
            setConfig((prev) => ({
                ...prev,
                isFinalized: confirmation.isFinalized,
                finalizedAt: confirmation.finalizedAt,
            }));
        }
    };

    useEffect(() => {
        if (activeTab === 'commands' && userRole != 'student') {
            if (subjectId && teams && teams.length > 0 && !config.isFinalized) {
                handleValidateTeams(subjectId, teams);
            }
        }
    }, [activeTab, teams, subjectId, userRole]);

    const randomActionDisabled =
        userRole === 'student' || config.distributionMode !== 'Random' || config.isFinalized;
    const manualActionDisabled =
        userRole === 'student' || config.distributionMode !== 'Manual' || config.isFinalized;
    const draftActionDisabled =
        userRole === 'student' || config.distributionMode !== 'Draft' || config.isFinalized;
    const configActionDisabled = userRole === 'student' || config.isFinalized;

    const handleTeamUpdate = (teamId: string, updater: (team: Team) => Team) => {
        setTeams(teams.map((team) => (team.id === teamId ? updater(team) : team)));
    };

    return (
        <>
            <div className='max-w-4xl mx-auto'>
                <div className='flex border-b border-slate-200 mb-8 bg-white/60 backdrop-blur-sm rounded-t-3xl px-2 pt-2'>
                    <button
                        className={`px-6 py-3 font-semibold transition-all rounded-t-2xl ${activeTab === 'feed' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => handleActiveTab('feed')}
                    >
                        Лента
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-all rounded-t-2xl ${activeTab === 'students' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => handleActiveTab('students')}
                    >
                        Студенты
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-all rounded-t-2xl ${activeTab === 'commands' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => handleActiveTab('commands')}
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
                            {userRole !== 'student' && (
                                <div className='flex flex-col gap-3 items-end'>
                                    <div className='flex flex-row items-center gap-2 w-full justify-between'>
                                        {false && (
                                            <Brackets
                                                size={40}
                                                className={`p-2 rounded-xl font-bold shadow-lg transition-all ${draftActionDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-linear-to-r from-slate-700 to-slate-800 text-white hover:-translate-y-0.5'}`}
                                                onClick={() => {
                                                    if (draftActionDisabled) return;
                                                    navigate(`/subject/${subjectId}/teams/draft`);
                                                }}
                                            />
                                        )}
                                        <Dices
                                            size={40}
                                            className={`p-2 rounded-xl font-bold shadow-lg transition-all ${randomActionDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-linear-to-r from-purple-600 to-purple-700 text-white hover:-translate-y-0.5'}`}
                                            onClick={() => {
                                                if (randomActionDisabled) return;
                                                navigate(`/subject/${subjectId}/teams/random`);
                                            }}
                                        />
                                        <Plus
                                            size={40}
                                            className={`p-2 rounded-xl font-bold shadow-lg transition-all ${manualActionDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-linear-to-r from-green-600 to-green-700 text-white hover:-translate-y-0.5'}`}
                                            onClick={() => {
                                                if (manualActionDisabled) return;
                                                setShowCreateTeamManually(true);
                                            }}
                                        />
                                        <Settings
                                            size={40}
                                            className={`p-2 rounded-xl font-bold shadow-lg transition-all ${configActionDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:-translate-y-0.5'}`}
                                            onClick={() => {
                                                if (configActionDisabled) return;
                                                setShowConfig(true);
                                            }}
                                        />
                                    </div>
                                    {teams && teams.length > 0 && (
                                        <button
                                            disabled={config.isFinalized}
                                            className='text-md bg-linear-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all w-full disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed'
                                            onClick={finalize}
                                        >
                                            {config.isFinalized
                                                ? 'Команды сформированы'
                                                : 'Закончить формирование'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='flex flex-col gap-2 my-2'>
                            {configError && (
                                <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100 backdrop-blur-sm shadow-md'>
                                    <p className='text-sm text-red-700'>{configError}</p>
                                </div>
                            )}
                            {validationDetails && (
                                <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100 backdrop-blur-sm shadow-md'>
                                    <p className='text-lg text-red-700 font-semibold mb-1'>
                                        ❌ Ошибка
                                    </p>
                                    <p className='text-sm text-red-700 whitespace-pre-line'>
                                        {errorMessageMapper(validationDetails.errors)}
                                        {warningMessageMapper(validationDetails.warnings)}
                                    </p>
                                </div>
                            )}
                            {showLoader && (
                                <div className='p-4 bg-blue-50 border-b-blue-50 rounded-xl border border-blue-100 backdrop-blur-sm shadow-md'>
                                    <p className='text-sm text-blue-700'>
                                        Загрузка настроек команд...
                                    </p>
                                </div>
                            )}
                            <div className='p-4 bg-slate-50 border border-slate-100 rounded-xl backdrop-blur-sm shadow-md'>
                                <p className='text-sm text-slate-700 font-semibold'>
                                    Режим: {loadedDistributionMode}
                                </p>
                                <p className='text-xs text-slate-500 mt-1'>
                                    {config.requiresCaptain
                                        ? `Капитан включен, метод решения: выбор капитана, порог: ${config.finalDecisionThreshold}`
                                        : `Капитан выключен, метод решения: голосование, порог: ${config.finalDecisionThreshold}`}
                                </p>
                                {config.captainVotingDeadline && (
                                    <p className='text-xs text-slate-500 mt-1'>
                                        Дедлайн голосования за капитана:{' '}
                                        {new Date(config.captainVotingDeadline).toLocaleString(
                                            'ru-RU',
                                        )}
                                    </p>
                                )}
                                {config.finalDecisionDeadline && (
                                    <p className='text-xs text-slate-500 mt-1'>
                                        Дедлайн итогового решения:{' '}
                                        {new Date(config.finalDecisionDeadline).toLocaleString(
                                            'ru-RU',
                                        )}
                                    </p>
                                )}
                                {config.isFinalized && (
                                    <p className='text-xs text-amber-700 mt-2 font-semibold'>
                                        Команды финализированы. Изменения запрещены.
                                    </p>
                                )}
                            </div>
                            {details && details.isValid && (
                                <div className='p-4 bg-green-50 border-b-green-50 rounded-xl border border-green-100 backdrop-blur-sm shadow-md'>
                                    <p className='text-md text-green-700 font-semibold mb-1'>
                                        ✅ Валидация пройдена
                                    </p>
                                    <p className='text-sm text-green-600'>
                                        {'Распределение команд корректно'}
                                    </p>
                                </div>
                            )}
                            {details && !details.isValid && (
                                <div className='p-4 bg-red-50 border-b-red-50 rounded-xl border border-red-100 backdrop-blur-sm shadow-md'>
                                    <p className='text-md text-red-700 font-semibold mb-1'>
                                        ❌ Валидация провалена
                                    </p>
                                    <p className='text-sm text-red-600 whitespace-pre-line px-2'>
                                        {handleErrorMessages()}
                                    </p>
                                </div>
                            )}
                            {details && details.warnings.length > 0 && (
                                <div className='p-4 bg-orange-50 border-b-orange-50 rounded-xl border border-orange-100 backdrop-blur-sm shadow-md'>
                                    <p className='text-md text-amber-700 font-semibold mb-1'>
                                        ⚠️ Внимание
                                    </p>
                                    <p className='text-sm text-amber-600 whitespace-pre-line px-2'>
                                        {handleWarningMessages()}
                                    </p>
                                </div>
                            )}
                        </div>
                        {showLoader ? (
                            <div className='my-4 font-medium text-2xl w-full h-48 text-center text-gray-500 flex flex-col items-center justify-center bg-white rounded-2xl shadow-md border border-slate-100'>
                                <p className='font-normal text-lg'>Загрузка списка команд...</p>
                            </div>
                        ) : teams && teams.length > 0 ? (
                            <ul className='grid sm:grid-cols-1 md:grid-col </ul>s-2 lg:grid-cols-2 gap-4 mt-4'>
                                {teams.map((item, index) => {
                                    return (
                                        <CommandCard
                                            index={index}
                                            key={item.id}
                                            participants={item.members || []}
                                            captainName={
                                                item.members.find(
                                                    (participant) =>
                                                        participant.userId === item.captainId,
                                                )?.username ?? null
                                            }
                                            decisionInfo={
                                                item.finalDecision
                                                    ? `Итог: ${item.finalDecision.approved ? 'принято' : 'не принято'} (${item.finalDecision.method === 'CaptainDecision' ? 'капитан' : 'голосование'})`
                                                    : config.requiresCaptain
                                                      ? 'Финальное решение принимает капитан'
                                                      : 'Финальное решение принимает голосование команды'
                                            }
                                            onClick={() => handleSelectCommand(item.id, index)}
                                        />
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className='my-4 font-medium text-xl w-full h-48 text-center text-gray-500 flex flex-col items-center justify-center bg-white rounded-2xl shadow-md border border-slate-100'>
                                <p className='font-normal text-lg'>Команды еще не сформированы</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            {showModal && (
                <StudentsModal
                    onClose={handleCloseModal}
                    subjectId={subjectId ?? ''}
                    currentUserId={''}
                    selectedSubject={selectedSubject ?? null}
                />
            )}
            {showCommandParticipants && (
                <CommandParticipantsModal
                    commandNumber={selectedCommandIndex}
                    onClose={handleCloseCommandParticipants}
                    teams={teams}
                    currentUserId={profile.id ?? ''}
                    commandId={selectedCommand}
                    role={userRole}
                    config={config}
                    currentDistributionMode={loadedDistributionMode}
                    onTeamUpdate={handleTeamUpdate}
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
                    participantsCount={count}
                    subjectId={subjectId ?? ''}
                    onClose={() => {
                        setShowConfig(false);
                    }}
                    role={userRole}
                />
            )}
            {showCreateTeamManuallyModal && (
                <CreateTeamManually
                    onClose={() => {
                        setShowCreateTeamManually(false);
                    }}
                    subjectId={subjectId ?? ''}
                    role={userRole}
                />
            )}
        </>
    );
};

export default SubjectView;
