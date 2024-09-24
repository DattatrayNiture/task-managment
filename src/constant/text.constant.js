
const http_codes = {
    badRequest: 400,
    internalError: 500,
    created: 201,
    notFound: 404,
    ok: 200,
    notImplemented: 501,
    forbidden: 403,
    unAuthorized: 401,
    Conflict: 409
}

const messages = {
    success: "success",
    invalidBody: "Invalid body",
    tokenNotFound: "token not found",
    userAlreadyExistWithEmail: "User already exists with this email and email must be unique",
    emailReaquired: "email is required",
    unauthorized: "User is Unauthorized ",
    userNotFound: "user not found",
    forbidden: "This activity is not allowed for this user",
    taskNotFound: 'Task not found',
    loginSuccessfullly: "You are successfully logged in",
    internalServerError: "Internal server error",
    inValidTaskId: 'Invalid task ID format (taskId must be ObjectId)',
    userNotAdmin: "user not admin ",
    badRequest: "bad request",
    inValidLoginCredentials: "Invalid email or password",
    userRegistered: 'User registered successfully',
    taskCreated: 'Task created successfully'
}

const schema = {
    users: 'User',
    task: 'Task'
}

module.exports = {
    schema,
    http_codes,
    messages
}