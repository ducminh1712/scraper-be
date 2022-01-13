const express = require('express')
const router = express.Router();
const userService = require('../service/user.service')

const authenticate = async (req, res, next) => {
    try {
        const user = await userService.authenticate(req.body)
        if (user) {
            res.json(user)
        } else {
            res.status(400).json({ message: 'Invalid username or password' })
        }
    } catch (error) {
        next(error)
    }
}

router.post('/authenticate', authenticate)

module.exports = router