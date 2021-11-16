const express = require('express')
const { csrfProtection, asyncHandler } = require('./utils')
const { User, List, Task } = require('../db/models')
const { check, validationResult } = require('express-validator')

const router = express.Router()

const userValidators = [
    check('name')
        .exists({ checkFalsy: true })
        .withMessage('Please enter a list name')
        .isLength({ max: 50 })
        .withMessage('List name must not exceed 50 characters')
]

router.get('/', csrfProtection, asyncHandler(async (req, res, next) => {
    const userId = req.session.auth.userId;
    let lists = await List.findAll({
        where: {
            userId
        }
    })
    JSON.stringify(lists)

    let listNames = [];
    lists.forEach(list => {
        listNames.push(list.name)
    })
    res.render('lists', {
        listNames,
        csrfToken: req.csrfToken()
    })
}))

router.post('/', csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    const { name, userId } = req.body;
    const list = List.build({
        name,
        userId
    })
    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await list.save()
        res.locals.list = list;
        res.render('lists')
    } else {
        const errors = validatorErrors.array().map(err => err.msg)
        res.render('lists', {
            errors,
            csrfToken: req.csrfToken()
        })
    }
}))





module.exports = router;
