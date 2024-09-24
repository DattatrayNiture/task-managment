const Task = require('../models/task.model');
const { http_codes, messages } = require('../constant/text.constant');
const { error, success } = require('../common/res.common');
const Joi = require("joi");
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

exports.createTask = async (req, res) => {

    try {
        var schemaValidator;
        const schema = Joi.object({
            title: Joi.string().required().messages({
                'string.base': '"Title" should be a type of text',
                'string.empty': '"Title" cannot be an empty field',
                'any.required': '"Title" is a required field',
            }),
            description: Joi.string().optional(),
            status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
        });

        schemaValidator = schema.validate(req.body);
        if (schemaValidator.error) {
            return error(http_codes.badRequest, schemaValidator.error.message || messages.badRequest, res)
        } else {
            schemaValidator = schemaValidator.value;
        }

        const task = new Task({ ...req.body, created_by: new ObjectId(req.user.id) });

        await task.save();
        return success(http_codes.created, messages.taskCreated, task, res)

    } catch (err) {
        console.log("error : ", err)
        return error(http_codes.internalError, messages.internalServerError, res)
    }
};

exports.getTasks = async (req, res) => {
    try {
        if (req.user.role === 'admin') {



            const { limit, page } = req.query

            let perPage = parseInt(limit) || 10;
            let pages = typeof page != "undefined" ? page == 0 ? 1 : page || 1 : 1;
            let skip = perPage * pages - perPage;

            const pipeline = []
            pipeline.push({
                $match: {
                    is_active: true
                }
            })

            const countPipeLine = [...pipeline]
            countPipeLine.push({ $count: "count" })
            pipeline.push({ $skip: skip }, { $limit: perPage })
            const taskList = await Task.aggregate(pipeline);
            const taskCount = await Task.aggregate(countPipeLine);
            const data = {}
            data["result"] = taskList
            data["total_documents"] = (taskCount[0]?.count || 0)
            data["total_pages"] = Math.ceil((taskCount[0]?.count || 0) / perPage)
            data["current_page"] = parseInt(pages) || 1


            return success(http_codes.ok, messages.success, data, res)


            // const tasks = await Task.find();
            // return res.json(tasks);
        } else if ('user') {

            const { limit, page } = req.query

            let perPage = parseInt(limit) || 10;
            let pages = typeof page != "undefined" ? page == 0 ? 1 : page || 1 : 1;
            let skip = perPage * pages - perPage;

            const pipeline = []

            pipeline.push({
                $match: {
                    created_by: new ObjectId(req.user.id),
                    is_active: true
                }
            })

            // if (search) {
            //     pipeline.push({
            //         $match: {
            //             name: { $regex: search, $options: 'i' }
            //         }
            //     })
            // }

            const countPipeLine = [...pipeline]
            countPipeLine.push({ $count: "count" })
            pipeline.push({ $skip: skip }, { $limit: perPage })
            const taskList = await Task.aggregate(pipeline);
            const taskCount = await Task.aggregate(countPipeLine);
            const data = {}
            data["result"] = taskList
            data["total_documents"] = (taskCount[0]?.count || 0)
            data["total_pages"] = Math.ceil((taskCount[0]?.count || 0) / perPage)
            data["current_page"] = parseInt(pages) || 1

            return success(http_codes.ok, messages.success, data, res)
        }
        // const tasks = await Task.find({ created_by: req.user.id });
        // res.json(tasks);
    } catch (err) {
        console.log("error : ", err)
        return error(http_codes.internalError, messages.internalServerError, res)
    }
};

exports.getTaskById = async (req, res) => {
    try {

        if (!isValidObjectId(req.params.taskId) || !req.params.taskId) {
            return error(http_codes.badRequest, messages.inValidTaskId, res)
        }
        const task = await Task.findOne({ _id: new ObjectId(req.params.taskId), is_active: true });
        if (!task || (req.user.role !== 'admin' && task.created_by.toString() !== req.user.id)) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // res.json(task);
        return success(http_codes.ok, messages.success, task, res)
    } catch (err) {
        console.log("error : ", err)
        return error(http_codes.internalError, messages.internalServerError, res)
    }
};

exports.updateTask = async (req, res) => {
    try {
        var schemaValidator;
        const schema = Joi.object({
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
            taskId: Joi.string().required(),
        });

        schemaValidator = schema.validate(req.body);
        if (schemaValidator.error) {
            return error(http_codes.badRequest, schemaValidator.error.message || messages.badRequest, res)
        } else {
            schemaValidator = schemaValidator.value;
        }
        const { title, description, status, taskId } = req.body
        if (!title || !description || !status) {
            return error(http_codes.badRequest, messages.invalidBody, res)

        }
        const update = {
            updated_at: new Date().toISOString(),
        }
        if (title) {
            update["title"] = title
        }
        if (description) {
            update["description"] = description
        }
        if (status) {
            update["status"] = status
        }
        if (req.user.role !== 'admin') {
            return error(http_codes.forbidden, messages.forbidden, res)
        }
        const task = await Task.findOneAndUpdate({ _id: new ObjectId(taskId), is_active: true }, update, { new: true });
        if (!task) {
            return error(http_codes.notFound, messages.taskNotFound, res)
        }
        return success(http_codes.ok, messages.success, {}, res)
    } catch (err) {
        console.log("error : ", err)
        return error(http_codes.internalError, messages.internalServerError, res)
    }
};

exports.deleteTask = async (req, res) => {
    try {
        var schemaValidator;
        const schema = Joi.object({
            taskId: Joi.string().required(),
        });
        if (!isValidObjectId(req.params.taskId) || !req.params.taskId) {
            return error(http_codes.badRequest, messages.inValidTaskId, res)
        }
        schemaValidator = schema.validate(req.params);
        if (schemaValidator.error) {
            return error(http_codes.badRequest, schemaValidator.error.message || messages.badRequest, res)
        } else {
            schemaValidator = schemaValidator.value;
        }
        if (req.user.role !== 'admin') {
            return error(http_codes.forbidden, messages.forbidden, res);
        }
        const task = await Task.findOneAndUpdate({ _id: new ObjectId(req.params.taskId), is_active: true }, { is_active: false, updated_at: new Date().toISOString() });
        if (!task) return error(http_codes.notFound, messages.taskNotFound, res);
        return success(http_codes.ok, messages.success, {}, res)
    } catch (err) {
        console.log("error : ", err)
        return error(http_codes.internalError, messages.internalServerError, res)
    }
};
