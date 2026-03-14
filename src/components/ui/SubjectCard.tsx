import React, { JSX } from "react";
import { Subject } from "@/types/subject/Subject";

/**
 * @interface Participant
 * @property {string} userId - Unique identifier of the participant.
 * @property {string} username - Name of the participant.
 * @property {string} avatarUrl - URL of the participant's avatar.
 */
export interface Participant {
    /**
     * Unique identifier of the participant.
     */
    userId: string;
    /**
     * Name of the participant.
     */
    username: string;
    /**
     * URL of the participant's avatar.
     */
    avatarUrl: string;
}

/**
 * @interface SubjectCardProps
 * @property {Subject} subject - Subject entity to display.
 * @property {(subject: Subject) => void} onSelect - Handler for subject selection.
 * @property {Participant[]} participants - Array of participants to display avatars and badge.
 */
export interface SubjectCardProps {
    subject: Subject & {
        icon: React.ComponentType<{ size: number; className?: string }>;
        color: string;
        code: string;
        progress: number;
    };
    onSelect: (subject: SubjectCardProps["subject"]) => void;
    participants: Participant[];
}

/**
 * SubjectCard component for displaying subject information, participants avatars and badge.
 *
 * @param {SubjectCardProps} props - Component props.
 * @returns {JSX.Element} Rendered subject card.
 * @throws {Error} Throws if required props are missing or invalid.
 *
 * @example
 * <SubjectCard subject={subject} onSelect={handleSelect} participants={participants} />
 */
export const SubjectCard: React.FC<SubjectCardProps & { participantsError?: Error }> = ({ subject, onSelect, participants, participantsError }: SubjectCardProps & { participantsError?: Error }): JSX.Element => {
    const Icon = subject.icon;
    const avatarLimit = 3;
    const avatarsToShow: Participant[] = participants.slice(0, avatarLimit);
    const badgeCount = participants.length > avatarLimit ? participants.length - avatarLimit : 0;

    return (
        <div onClick={() => onSelect(subject)} className="group bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer" data-testid={`subject-card-${subject.id}`}>
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${subject.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={28} className="text-white" />
            </div>
            <h4 className="font-bold text-lg mb-1 text-slate-800">{subject.title}</h4>
            <p className="text-xs text-slate-400 mb-1">{subject.description}</p>
            <p className="text-xs font-mono text-slate-300 mb-4">Код: {subject.code}</p>
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-500">Прогресс</span>
                    <span className="text-xs font-bold text-blue-600" data-testid={`subject-progress-${subject.id}`}>{subject.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-linear-to-r ${subject.color}`} style={{ width: `${subject.progress}%` }} />
                </div>
            </div>
            <div className="flex -space-x-2">
                  {avatarsToShow.map((participant: Participant) => (
                      <img key={participant.userId} src={participant.avatarUrl} alt={participant.username}
                          className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 object-cover"
                          data-testid="avatar"
                      />
                  ))}
                {badgeCount > 0 && (
                    <div
                        className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm"
                        data-testid="badge"
                    >
                        +{badgeCount}
                    </div>
                )}
            </div>
            {participantsError && (
                <div data-testid={`participants-error-${subject.id}`}>Ошибка загрузки участников</div>
            )}
        </div>
    );
};