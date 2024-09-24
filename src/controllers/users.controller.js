const User = require('../models/user.model');
const { http_codes, messages } = require('../constant/text.constant');
const { error, success } = require('../common/res.common');
const Joi = require("joi");
const bcrypt = require('bcrypt');
const generateToken = require('../utils/jwt.utils');
exports.register = async (req, res) => {

    try {

        var schemaValidator;
        const schema = Joi.object({
            name: Joi.string().required().strict(),
            email: Joi.string().email().required().strict(),
            password: Joi.string().min(6).required().strict(),
            role: Joi.string().valid('user', 'admin').default('user'),
        });

        schemaValidator = schema.validate(req.body);
        if (schemaValidator.error) {
            return error(http_codes.badRequest, schemaValidator.error.message || messages.badRequest, res)
        } else {
            schemaValidator = schemaValidator.value;
        }

        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return error(http_codes.badRequest, messages.userAlreadyExistWithEmail, res)
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        return success(http_codes.created, messages.userRegistered, {}, res)
    } catch (err) {
        console.log("error: ", err)
        return error(http_codes.internalError, messages.internalServerError, res)

    }
};

exports.login = async (req, res) => {

    var schemaValidator;
    const schema = Joi.object({
        email: Joi.string().email().required().strict(),
        password: Joi.string().min(6).required().strict(),
    });

    schemaValidator = schema.validate(req.body);
    if (schemaValidator.error) {
        return error(http_codes.badRequest, schemaValidator.error.message || messages.badRequest, res)
    } else {
        schemaValidator = schemaValidator.value;
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return error(http_codes.unAuthorized, messages.inValidLoginCredentials, res)
    }

    const token = generateToken(user);
    const data = { token, user: { userId: user._id, name: user.name, email: user.email, role: user.role } };
    return success(http_codes.ok, messages.loginSuccessfullly, data, res)

};
