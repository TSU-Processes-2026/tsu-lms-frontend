const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const database = router.db;

const findUserByCredentials = (username, password) => {
  return database.get("users").find({ username, password }).value();
};

const findUserByUsername = (username) => {
  return database.get("users").find({ username }).value();
};

const save = (table, value) => {
  database.get(table).push(value).write();
};

const getMockedAuthResponse = (userId) => {
  return {
    tokenType: "Bearer",
    accessToken: "accessToken",
    refreshToken: "refreshToken",
    expiresIn: 900,
    refreshExpiresIn: 604800,
    userId: userId,
    sessionId: "3fa85f64-5717-4562-b3fc",
  };
};

const getMocked401Response = () => {
  return {
    type: "error",
    title: "Unauthorized",
    status: 401,
    detail: "Authorization is required",
  };
};

const getMocked409Response = () => {
  return {
    type: "error",
    title: "Conflict",
    status: 409,
    detail: "Username already used",
  };
};

const getBadCredentialsResponse = () => {
  return {
    type: "error",
    title: "Bad request",
    status: 400,
    detail: "Bad request",
  };
};

server.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  const user = findUserByCredentials(username, password);

  if (user === undefined) {
    res.status(401).jsonp(getMocked401Response);
  }

  const response = getMockedAuthResponse(user.id);
  res.status(200).jsonp(response);
});

server.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).jsonp(getBadCredentialsResponse);
  }

  if (
    username.length() < 3 ||
    password.length() < 6 ||
    password.length() > 20
  ) {
    res.status(400).jsonp(getBadCredentialsResponse);
  }

  const user = findUserByUsername(username);

  if (user) {
    res.status(409).jsonp(getMocked409Response);
  }

  const newId = `${Date.now()}-${Math.random().toString(36).substr(2)}`;
  const newUser = {
    id: newId,
    username: username,
    password: password,
  };

  save("users", newUser);

  res.status(201).jsonp({
    id: newUser.id,
    username: newUser.username,
  });
});
