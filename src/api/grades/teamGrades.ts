import { AxiosResponse } from 'axios';
import { apiClient } from '../axios-client';
import { ChangeTeamGradeRequest, TeamGradeRequest } from '@/types/grades/TeamGrade';

export const fetchTeamGrade = async (teamId: string, assignmentId: string): Promise<string> => {
    try {
        const res: AxiosResponse<string> = await apiClient.get<string>(
            `/teams/${teamId}/assignments/${assignmentId}/grade`,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const sendGradeToTeam = async (
    teamId: string,
    assignmentId: string,
    grade: TeamGradeRequest,
): Promise<string> => {
    try {
        const res: AxiosResponse<string> = await apiClient.post<string>(
            `/teams/${teamId}/assignments/${assignmentId}/grade`,
            grade,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const changeGradeToTeam = async (
    teamId: string,
    assignmentId: string,
    changeGrade: ChangeTeamGradeRequest,
): Promise<string> => {
    try {
        const res: AxiosResponse<string> = await apiClient.put<string>(
            `/teams/${teamId}/assignments/${assignmentId}/grade`,
            changeGrade,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const deleteGradeToTeam = async (teamId: string, assignmentId: string): Promise<string> => {
    try {
        const res: AxiosResponse<string> = await apiClient.delete<string>(
            `/teams/${teamId}/assignments/${assignmentId}/grade`,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const fetchStudentAssignedGrade = async (
    teamId: string,
    assignmentId: string,
    studentId: string,
): Promise<string> => {
    try {
        const res: AxiosResponse<string> = await apiClient.get<string>(
            `/teams/${teamId}/assignments/${assignmentId}/students/${studentId}/grade`,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const assignGradeToTeamMember = async (
    teamId: string,
    assignmentId: string,
    studentId: string,
    score: number,
): Promise<string> => {
    try {
        const res: AxiosResponse<string> = await apiClient.put<string>(
            `/teams/${teamId}/assignments/${assignmentId}/students/${studentId}/grade`,
            { score: score },
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTeamMemberGrade = async (
    teamId: string,
    assignmentId: string,
    studentId: string,
): Promise<string> => {
    try {
        const res: AxiosResponse<string> = await apiClient.delete<string>(
            `/teams/${teamId}/assignments/${assignmentId}/students/${studentId}/grade`,
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};
