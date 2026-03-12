const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const database = router.db;

const findUserByCredentials = (username, password) => {
    return database.get('users').find({ username, password }).value();
};

const findUserByUsername = (username) => {
    return database.get('users').find({ username }).value();
};

const getUserProfile = async () => {
    return {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        username: 'ivanov_ivan1',
        password: 'password123',
        accessToken: 'mock-token-1',
    };
};

const save = (table, value) => {
    database.get(table).push(value).write();
};

const getMockedAuthResponse = (userId) => {
    return {
        tokenType: 'Bearer',
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        expiresIn: 900,
        refreshExpiresIn: 604800,
        userId: userId,
        sessionId: '3fa85f64-5717-4562-b3fc',
    };
};

const getMocked401Response = () => {
    return {
        type: 'error',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authorization is required',
    };
};

const getMocked409Response = () => {
    return {
        type: 'error',
        title: 'Conflict',
        status: 409,
        detail: 'Username already used',
    };
};

const getBadCredentialsResponse = () => {
    return {
        type: 'error',
        title: 'Bad request',
        status: 400,
        detail: 'Bad request',
    };
};

const getBadRequestResponse = () => {
    return {
        type: 'error',
        title: 'Bad request',
        status: 400,
        detail: 'Неверные данные',
    };
};

server.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    const user = findUserByCredentials(username, password);

    if (!user) {
        return res.status(401).jsonp(getMocked401Response());
    }

    const response = getMockedAuthResponse(user.id);
    res.status(200).jsonp(response);
});

server.get('/api/users/me', async (req, res) => {
    const auth = req.headers.authorization;
    const accessToken = auth.split(' ')[1];
    if (!accessToken) return res.status(401).jsonp(getMocked401Response());

    const profile = await getUserProfile();

    res.status(200).jsonp({
        id: profile.id,
        username: profile.username,
    });
});

server.post('/api/subjects', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).jsonp(getBadRequestResponse);
    }

    const newId = `${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const newSubject = {
        id: newId,
        title: title,
        description: description,
    };

    save('subjects', newSubject);

    res.status(201).jsonp({
        id: newSubject.id,
        title: newSubject.title,
        description: newSubject.description,
    });
});

server.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).jsonp(getBadCredentialsResponse());
    }

    if (username.length < 3 || password.length < 6 || password.length > 20) {
        return res.status(400).jsonp(getBadCredentialsResponse());
    }

    const existingUser = findUserByUsername(username);

    if (existingUser) {
        return res.status(409).jsonp(getMocked409Response());
    }

    const newId = `${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const newUser = {
        id: newId,
        username: username,
        password: password,
    };

    save('users', newUser);

    res.status(201).jsonp({
        id: newUser.id,
        username: newUser.username,
    });
});

/**
 * Returns a standard ProblemDetails error object for API responses.
 * @param {number} status - HTTP status code.
 * @param {string} title - Short error title.
 * @param {string} detail - Detailed error message.
 * @returns {object} ProblemDetails error object.
 */
function getProblemDetails(status, title, detail) {
    return {
        type: 'error',
        title,
        status,
        detail,
    };
}

// =========================
// MOCK DATA ACCESS
// =========================

/**
 * Returns a mock array of subjects for the current user from the database.
 * @param {number} limit - Max number of subjects to return.
 * @param {number} offset - Offset for pagination.
 * @param {boolean} empty - If true, returns an empty array.
 * @returns {Array} Array of subject objects.
 */
function getMockSubjects(limit = 20, offset = 0, empty = false) {
    if (empty) return [];

    const allSubjects = database.get('subjects').value() || [];
    return allSubjects.slice(offset, offset + limit);
}

/**
 * Returns a mock subject by id from the database.
 * @param {string} subjectId - Subject identifier.
 * @returns {object|null} Subject object or null if not found.
 */
function getMockSubjectById(subjectId) {
    return database.get('subjects').find({ id: subjectId }).value() || null;
}

/**
 * Returns a mock array of participants for a subject from the database.
 * @param {string} subjectId - Subject identifier.
 * @param {number} limit - Max number of participants to return.
 * @param {number} offset - Offset for pagination.
 * @returns {Array} Array of participant objects.
 */
function getMockParticipants(subjectId, limit = 5, offset = 0) {
    const all = database.get('participants').filter({ subjectId }).value() || [];
    return all.slice(offset, offset + limit);
}

/**
 * Returns a mock array of assignments for a subject from the database.
 * @param {string} subjectId - Subject identifier.
 * @returns {Array} Array of assignment objects.
 */
function getMockAssignments(subjectId) {
    return database.get('assignments').filter({ subjectId }).value() || [];
}

/**
 * Returns a mock array of submissions for an assignment from the database.
 * @param {string} assignmentId - Assignment identifier.
 * @returns {Array} Array of submission objects.
 */
function getMockSubmissions(assignmentId) {
    return database.get('submissions').filter({ assignmentId }).value() || [];
}

/**
 * Returns a mock grade for a submission from the database.
 * @param {string} submissionId - Submission identifier.
 * @returns {object|null} Grade object or null if not found.
 */
function getMockGrade(submissionId) {
    return database.get('grades').find({ submissionId }).value() || null;
}

// =========================
// MOCK ENDPOINTS
// =========================

server.get('/api/subjects', (req, res) => {
    const { limit = 20, offset = 0, mockError, mockEmpty } = req.query;
    if (mockError === '401') {
        return res.status(401).jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    const empty = mockEmpty === 'true';
    const subjects = getMockSubjects(Number(limit), Number(offset), empty);
    res.status(200).jsonp(subjects);
});

server.get('/api/subjects/:subjectId', (req, res) => {
    const { subjectId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res.status(401).jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '404') {
        return res.status(404).jsonp(getProblemDetails(404, 'Not Found', 'Subject not found'));
    }
    const subject = getMockSubjectById(subjectId);
    if (!subject) {
        return res.status(404).jsonp(getProblemDetails(404, 'Not Found', 'Subject not found'));
    }
    res.status(200).jsonp(subject);
});

server.get('/api/subjects/:subjectId/participants', (req, res) => {
    const { subjectId } = req.params;
    const { limit = 5, offset = 0, mockError } = req.query;
    if (mockError === '401') {
        return res.status(401).jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res.status(403).jsonp(getProblemDetails(403, 'Forbidden', 'User is not a participant of this subject'));
    }
    const participants = getMockParticipants(subjectId, Number(limit), Number(offset));
    res.status(200).jsonp(participants);
});

server.get('/api/subjects/:subjectId/assignments', (req, res) => {
    const { subjectId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res.status(401).jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res.status(403).jsonp(getProblemDetails(403, 'Forbidden', 'User is not a participant of this subject'));
    }
    const assignments = getMockAssignments(subjectId);
    res.status(200).jsonp(assignments);
});

server.get('/api/assignments/:assignmentId/submissions', (req, res) => {
    const { assignmentId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res.status(401).jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res.status(403).jsonp(getProblemDetails(403, 'Forbidden', 'Only teachers can view submissions'));
    }
    const submissions = getMockSubmissions(assignmentId);
    res.status(200).jsonp(submissions);
});

server.get('/api/submissions/:submissionId/grade', (req, res) => {
    const { submissionId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res.status(401).jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res.status(403).jsonp(getProblemDetails(403, 'Forbidden', 'Only author or teacher can view grade'));
    }
    const grade = getMockGrade(submissionId);
    if (!grade) {
        return res.status(404).jsonp(getProblemDetails(404, 'Not Found', 'Grade not found'));
    }
    res.status(200).jsonp(grade);
});

server.use('/api', router);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
    console.log(`Endpoints:`);
    console.log(`  POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  GET  http://localhost:${PORT}/api/users`);
    console.log(`  GET  http://localhost:${PORT}/api/subjects`);
    console.log(`  GET  http://localhost:${PORT}/api/subjects/:subjectId`);
    console.log(`  GET  http://localhost:${PORT}/api/subjects/:subjectId/participants`);
    console.log(`  GET  http://localhost:${PORT}/api/subjects/:subjectId/assignments`);
    console.log(`  GET  http://localhost:${PORT}/api/assignments/:assignmentId/submissions`);
    console.log(`  GET  http://localhost:${PORT}/api/submissions/:submissionId/grade`);
});
