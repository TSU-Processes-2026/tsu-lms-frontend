import { fetchSubjectTeamDraft } from '@/api/command/command';
import { DraftResponse } from '@/types/command/Draft';
import { useEffect, useState } from 'react';

export const useFetchDraft = (subjectId: string) => {
    const [draft, setDraft] = useState<DraftResponse | null>(null);
    const [isDraftLoading, setIsDraftLoading] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        setIsDraftLoading(true);

        const findPrevDraft = async (subjectId: string) => {
            try {
                const response: DraftResponse = await fetchSubjectTeamDraft(subjectId);
                if (isMounted) {
                    draft
                        ? setDraft((prev) => ({
                              ...prev,
                              ...response,
                          }))
                        : setDraft({ ...response });
                }
            } catch (error) {
                setDraft(null);
            } finally {
                isMounted && setIsDraftLoading(false);
            }
        };

        findPrevDraft(subjectId);

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        draft,
        isDraftLoading,
    };
};
