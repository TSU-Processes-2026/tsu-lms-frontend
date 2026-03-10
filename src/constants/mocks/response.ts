import { ErrorDetails } from '@/types/error/ErrorDetails';

const mockErrorResponse: ErrorDetails = {
    type: 'error',
    title: 'Bad Request',
    status: 400,
    detail: 'Title is required',
};

const mockUnauthorizedResponse: ErrorDetails = {
    type: 'error',
    title: 'Unauthorized',
    status: 401,
    detail: 'Authentication required',
};

const mockServerErrorResponse: ErrorDetails = {
    type: 'error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'Something went wrong',
};

const error400Response = {
    response: {
        status: 400,
        data: mockErrorResponse,
        headers: { 'content-type': 'application/json' },
    },
    isAxiosError: true,
};

const error401Response = {
    response: {
        status: 401,
        data: mockUnauthorizedResponse,
        headers: { 'content-type': 'application/json' },
    },
    isAxiosError: true,
};

const error500Response = {
    response: {
        status: 500,
        data: mockServerErrorResponse,
        headers: { 'content-type': 'application/json' },
    },
    isAxiosError: true,
};

export {
    error400Response,
    error401Response,
    error500Response,
    mockErrorResponse,
    mockUnauthorizedResponse,
    mockServerErrorResponse,
};
