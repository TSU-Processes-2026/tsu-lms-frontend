import {Subject} from "@/types/subjects/Subject.ts";
import {Calculator, FlaskConical, Landmark, Languages} from "lucide-react";

export const INITIAL_DATA = {
    subjects: [
        { id: 'sub1', name: 'Математика', students: 24, materials: 8, assignments: 6, icon: Calculator, color: 'from-blue-400 to-blue-600', progress: 75, teacher: 'Александр И.', creatorId: 'u1', code: 'MATH001' },
        { id: 'sub2', name: 'Естествознание', students: 18, materials: 5, assignments: 2, icon: FlaskConical, color: 'from-cyan-400 to-cyan-600', progress: 92, teacher: 'Мария С.', creatorId: 'u2', code: 'SCIENCE01' },
        { id: 'sub3', name: 'История', students: 30, materials: 12, assignments: 4, icon: Landmark, color: 'from-amber-400 to-amber-600', progress: 65, teacher: 'Дмитрий В.', creatorId: 'u1', code: 'HIST001' },
        { id: 'sub4', name: 'Языки', students: 15, materials: 7, assignments: 2, icon: Languages, color: 'from-purple-400 to-purple-600', progress: 88, teacher: 'Елена П.', creatorId: 'u1', code: 'LANG001' },
    ] as Subject[],
};
