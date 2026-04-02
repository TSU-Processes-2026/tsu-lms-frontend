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

server.get('/api/subjects/:subjectId/teams', async (req, res) => {
    try {
        const { subjectId } = req.params;
        const teams = database.get('teams').filter({ subjectId }).value();
        res.status(200).json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

server.get('/api/subjects/:subjectId/teams/unassigned', async (req, res) => {
    try {
        const { subjectId } = req.params;
        const teams = database.get('teams').filter({ subjectId }).value();
        const participants = database.get('participants').filter({ subjectId }).value();
        const unassignedStudents = participants.filter((student) => {
            const isInAnyTeam = teams.some((team) =>
                team.members.some((member) => member.userId === student.userId),
            );
            return student.role === 'Student' && !isInAnyTeam;
        });
        const response = {
            subjectId: subjectId,
            studentIds: [],
            students: unassignedStudents,
        };
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
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

/**
 * Returns a mock array of posts for a subject from the database.
 * @param {string} subjectId - Subject identifier.
 * @param {number} limit - Max number of posts to return.
 * @param {number} offset - Offset for pagination.
 * @returns {Array} Array of post objects.
 */
function getMockPosts(subjectId, limit = 20, offset = 0) {
    const all = database.get('posts').filter({ subjectId }).value() || [];
    return all.slice(offset, offset + limit);
}

/**
 * Creates a mock post for a subject in the database.
 * @param {string} subjectId - Subject identifier.
 * @param {object} postData - Post data (type, content, file).
 * @returns {object} Created post object.
 */
function createMockPost(subjectId, postData) {
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const newPost = {
        id: newId,
        subjectId,
        ...postData,
        createdAt: new Date().toISOString(),
    };
    database.get('posts').push(newPost).write();
    return newPost;
}

/**
 * Returns a mock array of comments for a target (post).
 * @param {string} targetId - Target identifier (postId).
 * @param {string} targetType - Target type (e.g., 'post').
 * @param {number} limit - Max number of comments to return.
 * @param {number} offset - Offset for pagination.
 * @returns {Array} Array of comment objects.
 */
function getMockComments(targetId, targetType = 'post', limit = 20, offset = 0) {
    const all = database.get('comments').filter({ targetId, targetType }).value() || [];
    return all.slice(offset, offset + limit);
}

/**
 * Creates a mock comment for a post in the database.
 * @param {object} commentData - Comment data (targetId, targetType, text, authorId).
 * @returns {object} Created comment object.
 */
function createMockComment(commentData) {
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const newComment = {
        id: newId,
        ...commentData,
        createdAt: new Date().toISOString(),
    };
    database.get('comments').push(newComment).write();
    return newComment;
}

/**
 * Adds a participant to a subject in the database.
 * @param {string} subjectId - Subject identifier.
 * @param {object} participantData - Participant data (userId, role).
 * @returns {object} Created participant object.
 */
function addMockParticipant(subjectId, participantData) {
    const newParticipant = {
        subjectId,
        ...participantData,
    };
    database.get('participants').push(newParticipant).write();
    return newParticipant;
}

/**
 * Updates a participant's role in a subject.
 * @param {string} subjectId - Subject identifier.
 * @param {string} userId - User identifier.
 * @param {string} role - New role.
 * @returns {object|null} Updated participant object or null if not found.
 */
function updateMockParticipantRole(subjectId, userId, role) {
    const participant = database.get('participants').find({ subjectId, userId }).value();
    if (!participant) return null;
    participant.role = role;
    database.get('participants').find({ subjectId, userId }).assign({ role }).write();
    return participant;
}

/**
 * Removes a participant from a subject.
 * @param {string} subjectId - Subject identifier.
 * @param {string} userId - User identifier.
 * @returns {boolean} True if removed, false otherwise.
 */
function removeMockParticipant(subjectId, userId) {
    const removed = database.get('participants').remove({ subjectId, userId }).write();
    return removed.length > 0;
}

/**
 * Joins a subject by invite code (mock).
 * @param {string} subjectId - Subject identifier.
 * @param {string} userId - User identifier.
 * @returns {object} Participant object.
 */
function joinMockSubject(subjectId, userId) {
    const participant = { subjectId, userId, role: 'student' };
    database.get('participants').push(participant).write();
    return participant;
}

// =========================
// MOCK ENDPOINTS
// =========================

server.get('/api/subjects', (req, res) => {
    const { limit = 20, offset = 0, mockError, mockEmpty } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    const empty = mockEmpty === 'true';
    const subjects = getMockSubjects(Number(limit), Number(offset), empty);
    res.status(200).jsonp(subjects);
});

server.get('/api/subjects/:subjectId', (req, res) => {
    const { subjectId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
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
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(
                getProblemDetails(403, 'Forbidden', 'User is not a participant of this subject'),
            );
    }
    const participants = getMockParticipants(subjectId, Number(limit), Number(offset));
    res.status(200).jsonp(participants);
});

server.get('/api/subjects/:subjectId/assignments', (req, res) => {
    const { subjectId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(
                getProblemDetails(403, 'Forbidden', 'User is not a participant of this subject'),
            );
    }
    const assignments = getMockAssignments(subjectId);
    res.status(200).jsonp(assignments);
});

server.get('/api/assignments/:assignmentId/submissions', (req, res) => {
    const { assignmentId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(getProblemDetails(403, 'Forbidden', 'Only teachers can view submissions'));
    }
    const submissions = getMockSubmissions(assignmentId);
    res.status(200).jsonp(submissions);
});

server.get('/api/submissions/:submissionId/grade', (req, res) => {
    const { submissionId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(getProblemDetails(403, 'Forbidden', 'Only author or teacher can view grade'));
    }
    const grade = getMockGrade(submissionId);
    if (!grade) {
        return res.status(404).jsonp(getProblemDetails(404, 'Not Found', 'Grade not found'));
    }
    res.status(200).jsonp(grade);
});

// =========================
// POSTS ENDPOINTS
// =========================

server.get('/api/subjects/:subjectId/posts', (req, res) => {
    const { subjectId } = req.params;
    const { limit = 20, offset = 0, postType, mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(
                getProblemDetails(403, 'Forbidden', 'User is not a participant of this subject'),
            );
    }
    let posts = getMockPosts(subjectId, Number(limit), Number(offset));
    if (postType) {
        posts = posts.filter((p) => p.postType === postType);
    }
    res.status(200).jsonp(posts);
});

server.post('/api/subjects/:subjectId/posts', (req, res) => {
    const { subjectId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(
                getProblemDetails(403, 'Forbidden', 'User is not a participant of this subject'),
            );
    }
    const postData = req.body;
    if (!postData || !postData.content) {
        return res.status(400).jsonp(getProblemDetails(400, 'Bad request', 'Content is required'));
    }
    const newPost = createMockPost(subjectId, postData);
    res.status(201).jsonp(newPost);
});

// =========================
// COMMENTS ENDPOINTS
// =========================

server.get('/api/comments', (req, res) => {
    const { targetId, targetType = 'post', limit = 20, offset = 0, mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(getProblemDetails(403, 'Forbidden', 'User is not allowed to view comments'));
    }
    if (!targetId) {
        return res.status(400).jsonp(getProblemDetails(400, 'Bad request', 'targetId is required'));
    }
    const comments = getMockComments(targetId, targetType, Number(limit), Number(offset));
    res.status(200).jsonp(comments);
});

server.post('/api/comments', (req, res) => {
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(getProblemDetails(403, 'Forbidden', 'User is not allowed to comment'));
    }
    const commentData = req.body;
    if (!commentData || !commentData.targetId || !commentData.text) {
        return res
            .status(400)
            .jsonp(getProblemDetails(400, 'Bad request', 'targetId and text are required'));
    }
    const newComment = createMockComment(commentData);
    res.status(201).jsonp(newComment);
});

// =========================
// PARTICIPANTS ENDPOINTS
// =========================

server.post('/api/subjects/:subjectId/participants', (req, res) => {
    const { subjectId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(getProblemDetails(403, 'Forbidden', 'User is not allowed to add participants'));
    }
    const participantData = req.body;
    if (!participantData || !participantData.userId || !participantData.role) {
        return res
            .status(400)
            .jsonp(getProblemDetails(400, 'Bad request', 'userId and role are required'));
    }
    const newParticipant = addMockParticipant(subjectId, participantData);
    res.status(201).jsonp(newParticipant);
});

server.patch('/api/subjects/:subjectId/participants/:userId', (req, res) => {
    const { subjectId, userId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(
                getProblemDetails(
                    403,
                    'Forbidden',
                    'User is not allowed to update participant role',
                ),
            );
    }
    const { role } = req.body;
    if (!role) {
        return res.status(400).jsonp(getProblemDetails(400, 'Bad request', 'role is required'));
    }
    const updated = updateMockParticipantRole(subjectId, userId, role);
    if (!updated) {
        return res.status(404).jsonp(getProblemDetails(404, 'Not Found', 'Participant not found'));
    }
    res.status(200).jsonp(updated);
});

server.delete('/api/subjects/:subjectId/participants/:userId', (req, res) => {
    const { subjectId, userId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(
                getProblemDetails(403, 'Forbidden', 'User is not allowed to remove participant'),
            );
    }
    const removed = removeMockParticipant(subjectId, userId);
    if (!removed) {
        return res.status(404).jsonp(getProblemDetails(404, 'Not Found', 'Participant not found'));
    }
    res.status(204).send();
});

server.post('/api/subjects/:subjectId/join', (req, res) => {
    const { subjectId } = req.params;
    const { userId, mockError } = req.body;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (!userId) {
        return res.status(400).jsonp(getProblemDetails(400, 'Bad request', 'userId is required'));
    }
    const participant = joinMockSubject(subjectId, userId);
    res.status(200).jsonp(participant);
});

// =========================
// ASSIGNMENTS CREATE ENDPOINT
// =========================

server.post('/api/subjects/:subjectId/assignments', (req, res) => {
    const { subjectId } = req.params;
    const { mockError } = req.query;
    if (mockError === '401') {
        return res
            .status(401)
            .jsonp(getProblemDetails(401, 'Unauthorized', 'Authorization is required'));
    }
    if (mockError === '403') {
        return res
            .status(403)
            .jsonp(
                getProblemDetails(403, 'Forbidden', 'User is not allowed to create assignments'),
            );
    }
    const assignmentData = req.body;
    if (!assignmentData || !assignmentData.content) {
        return res.status(400).jsonp(getProblemDetails(400, 'Bad request', 'content is required'));
    }
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const newAssignment = {
        id: newId,
        subjectId,
        ...assignmentData,
        createdAt: new Date().toISOString(),
    };
    database.get('assignments').push(newAssignment).write();
    res.status(201).jsonp(newAssignment);
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
    console.log(`  POST http://localhost:${PORT}/api/posts`);
    console.log(`  GET  http://localhost:${PORT}/api/posts`);
    console.log(`  POST http://localhost:${PORT}/api/comments`);
    console.log(`  GET  http://localhost:${PORT}/api/comments`);
    console.log(`  POST http://localhost:${PORT}/api/subjects/:subjectId/participants`);
    console.log(
        `  PUT  http://localhost:${PORT}/api/subjects/:subjectId/participants/:userId/role`,
    );
    console.log(`  DELETE http://localhost:${PORT}/api/subjects/:subjectId/participants/:userId`);
});
