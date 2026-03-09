import React from "react";

export interface Subject {
    id: string; name: string; students: number; materials: number; assignments: number;
    icon: React.ElementType; color: string; progress: number; teacher: string;
    creatorId: string; code: string;
}
