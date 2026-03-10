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

const getUserProfile = () => {
    return database.get('users')[0];
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

server.get('/api/users/me', (req, res) => {
    const auth = req.headers.authorization;
    const accessToken = auth.split(' ')[1];
    if (!accessToken) return res.status(401).jsonp(getMocked401Response());

    const profile = getUserProfile();

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

server.use('/api', router);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
    console.log(`Endpoints:`);
    console.log(`  POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  GET  http://localhost:${PORT}/api/users`);
});
