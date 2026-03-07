export interface CreateSubjectRequest extends CreateSubject {}

export interface CreateSubjectResponse extends CreateSubject {
    id: string
}

interface CreateSubject {
    title: string
    description: string
}