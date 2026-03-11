import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubjectsPage } from "@/pages/Subjects/index.tsx";

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
        const urlString = String(url);
        if (urlString.match(/\/api\/subjects(\?.*)?$/)) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        title: 'Mathematics',
                        description: 'Algebra and Geometry',
                    },
                    {
                        id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
                        title: 'Physics',
                        description: 'Mechanics and Optics',
                    },
                ]),
            } as Response);
        }
        if (urlString.match(/\/api\/subjects\/.{36}\/participants/)) {
            const match = urlString.match(/\/api\/subjects\/(.{36})\/participants/);
            const subjectId = match ? match[1] : '';
            if (subjectId === '3fa85f64-5717-4562-b3fc-2c963f66afa6') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        { userId: 'u1', role: 'Student' },
                        { userId: 'u2', role: 'Teacher' },
                    ]),
                } as Response);
            }
            if (subjectId === '4fa85f64-5717-4562-b3fc-2c963f66afa7') {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({ title: 'Internal Server Error' }),
                } as Response);
            }
        }
        return Promise.reject(new Error('Unknown endpoint'));
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

/**
 * Tests for SubjectsPage component.
 *
 * These tests verify that:
 * 1. The API request for the subjects list is made on mount.
 * 2. The successful API response is handled correctly.
 * 3. The subject cards are rendered with the correct name and description.
 * 4. Loading skeletons are shown while waiting for server response.
 * 5. Empty state is shown if there are no subjects.
 * 6. Error state is shown for network errors (e.g., 401 Unauthorized).
 * 7. Partial data unavailability (e.g., failed to load participants for one card) is handled gracefully.
 * 8. Progress is safely calculated for subjects with no assignments (no division by zero, shows 0% or 100% as required).
 */
describe('SubjectsPage', () => {
    it('should send API request to fetch subjects list on mount', async () => {
        render(<SubjectsPage />);
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/subjects'),
                expect.any(Object)
            );
        });
    });

    it('should render subject cards with correct title and description', async () => {
        render(<SubjectsPage />);
        expect(await screen.findByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('Algebra and Geometry')).toBeInTheDocument();
        expect(screen.getByText('Physics')).toBeInTheDocument();
        expect(screen.getByText('Mechanics and Optics')).toBeInTheDocument();
    });

    it('should show loading skeletons while waiting for server response', async () => {
        jest.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise(() => {}));
        render(<SubjectsPage />);
        expect(screen.getByTestId('subjects-skeleton')).toBeInTheDocument();
    });

    it('should show empty state if there are no subjects', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([]),
        } as Response);
        render(<SubjectsPage />);
        expect(await screen.findByTestId('subjects-empty')).toBeInTheDocument();
    });

    it('should show error state if network error occurs (e.g., 401 Unauthorized)', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ title: 'Unauthorized' }),
        } as Response);
        render(<SubjectsPage />);
        expect(await screen.findByTestId('subjects-error')).toBeInTheDocument();
        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
    });

    it('should handle partial data unavailability (failed to load participants for one card)', async () => {
        render(<SubjectsPage />);
        expect(await screen.findByTestId('participant-avatar-u1')).toBeInTheDocument();
        expect(await screen.findByTestId('participants-error-4fa85f64-5717-4562-b3fc-2c963f66afa7')).toBeInTheDocument();
    });
    it('should safely calculate progress for subjects with no assignments (shows 0% or 100%)', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([
                { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', title: 'Math', description: 'Algebra', assignments: [] },
            ]),
        } as Response);
        render(<SubjectsPage />);
        expect(await screen.findByTestId('subject-progress-3fa85f64-5717-4562-b3fc-2c963f66afa6')).toHaveTextContent(/0%|100%/);
    });
});