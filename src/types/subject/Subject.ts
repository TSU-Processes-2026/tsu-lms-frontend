/**
 * Interface representing a subject entity.
 *
 * @property {string} id - Unique identifier of the subject (UUID format).
 * @property {string} title - Title of the subject.
 * @property {string} description - Description of the subject.
 *
 * @example
 * {
 *   id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   title: "Проектирование архитектуры ПО",
 *   description: "Курс по UML и паттернам проектирования"
 * }
 */
export interface Subject {
    id: string;
    title: string;
    description: string;
}
