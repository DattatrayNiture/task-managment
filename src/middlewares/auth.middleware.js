const jwt = require('jsonwebtoken');
const { http_codes, messages } = require('../constant/text.constant');
const { error, success } = require('../common/res.common');

const authenticate = (req, res, next) => {
    console.log("req.headers['authorization'] ", req.headers['authorization'])

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token)  return error(http_codes.forbidden, messages.tokenNotFound, res)  ;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return error(http_codes.unAuthorized, messages.unauthorized, res)
        }
        req.user = decoded;
        next();
    });
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (roles.length && !roles.includes(req.user.role)) {
            return error(http_codes.forbidden, messages.forbidden, res)
        }
        next();
    };
};

module.exports = { authenticate, authorize };














// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

// const login = async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });

//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
//   user.refreshToken = refreshToken;
//   await user.save();

//   res.json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
// };





// authRoutes.js
// router.post('/refresh-token', async (req, res) => {
//     const { token } = req.body;
//     const user = await User.findOne({ refreshToken: token });
  
//     if (!user) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }
  
//     const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ accessToken });
//   });






// const request = require('supertest');
// const app = require('../src/app'); // Assuming app.js exports your Express app

// describe('Auth API', () => {
//   it('should register a user', async () => {
//     const response = await request(app).post('/api/register').send({
//       name: 'Jane Doe',
//       email: 'jane@example.com',
//       password: 'password123',
//       role: 'user',
//     });
//     expect(response.statusCode).toBe(201);
//     expect(response.body.message).toBe('User registered successfully');
//   });

//   it('should login a user and return tokens', async () => {
//     const response = await request(app).post('/api/login').send({
//       email: 'jane@example.com',
//       password: 'password123',
//     });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toHaveProperty('accessToken');
//     expect(response.body).toHaveProperty('refreshToken');
//   });

//   it('should refresh access token', async () => {
//     const loginResponse = await request(app).post('/api/login').send({
//       email: 'jane@example.com',
//       password: 'password123',
//     });

//     const response = await request(app).post('/api/refresh-token').send({
//       token: loginResponse.body.refreshToken,
//     });
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toHaveProperty('accessToken');
//   });
// });

  

