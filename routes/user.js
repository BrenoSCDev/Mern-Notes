const express = require('express')
const router = express.Router()
const usersController = require('../controllers/userController')

router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUsers)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUsers)

module.exports = router