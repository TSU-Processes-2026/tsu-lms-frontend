import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubjectsPage } from "@/pages/Subjects/index.tsx";

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
        const urlString = String(url);
        if (urlString.includes('/api/subjects')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 1,
                        name: 'Mathematics',
                        description: 'Algebra and Geometry',
                    },
                    {
                        id: 2,
                        name: 'Physics',
                        description: 'Mechanics and Optics',
                    },
                ]),
            } as Response);
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

    it('should render subject cards with correct name and description', async () => {
        render(<SubjectsPage />);
        expect(await screen.findByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('Algebra and Geometry')).toBeInTheDocument();
        expect(screen.getByText('Physics')).toBeInTheDocument();
        expect(screen.getByText('Mechanics and Optics')).toBeInTheDocument();
    });
});

