import React, {JSX} from "react";
import { User as UserIcon } from "lucide-react";
import { Subject } from "@/types/subject/Subject";

/**
 * Props for SubjectCard component.
 *
 * @property {Subject} subject - Subject entity to display.
 * @property {(subject: Subject) => void} onSelect - Handler for subject selection.
 */
export interface SubjectCardProps {
    subject: Subject & {
        icon: React.ComponentType<{ size: number; className?: string }>;
        color: string;
        code: string;
        progress: number;
        students: number;
    };
    onSelect: (subject: SubjectCardProps["subject"]) => void;
}

/**
 * SubjectCard component for displaying subject information.
 *
 * @param {SubjectCardProps} props - Component props.
 * @returns {JSX.Element} Rendered subject card.
 * @throws {Error} Throws if required props are missing or invalid.
 *
 * @example
 * <SubjectCard subject={subject} onSelect={handleSelect} />
 */
export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onSelect }: SubjectCardProps): JSX.Element => {
    const Icon = subject.icon;
    return (
        <div onClick={() => onSelect(subject)}
             className="group bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer">
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${subject.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={28} className="text-white" />
            </div>
            <h4 className="font-bold text-lg mb-1 text-slate-800">{subject.title}</h4>
            <p className="text-xs text-slate-400 mb-1">{subject.description}</p>
            <p className="text-xs font-mono text-slate-300 mb-4">Код: {subject.code}</p>
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-500">Прогресс</span>
                    <span className="text-xs font-bold text-blue-600">{subject.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-linear-to-r ${subject.color}`} style={{ width: `${subject.progress}%` }} />
                </div>
            </div>
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center">
                        <UserIcon size={12} className="text-slate-500" />
                    </div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                    +{subject.students - 3}
                </div>
            </div>
        </div>
    );
};
