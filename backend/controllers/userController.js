const User = require('../models/user')
const Note = require('../models/note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


const getAllUsers = asyncHandler (async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length){
        return res.status(400).json({message: 'No Users Found'})
    }
    res.json(users)
})

const createNewUsers = asyncHandler (async (req, res) => {
    const { username, password, roles } = req.body

    if (!username || !password || Array.isArray(roles) || !roles.length){
        return res.status(400).json({})
    }
    const usedEmail = await User.findOne({ username }).lean().exec()
    if (usedEmail) {
        return res.status(409).json({message: 'Email already in use.'})
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const userData = { username, "password": hashedPassword, roles }

    const user = await User.create(userData)

    if (user){
        res.status(201).json({ message: "New user created" })
    } else {
        res.status(400).json({ message: 'Invalid user data received'})
    }
})

const updateUser = asyncHandler( async (req, res) => {
    const id = req.body
    const { username, roles, active, password } = req.body
    console.log(id)

    if ( !id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean' ){
        return res.status(400).json({message: 'All fields are required'})
    }
    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: 'User not found'})
    }
    const usedUser = await User.findOne({ username }).lean().exec()

    if (usedUser && usedUser?._id.toString() !== id){
        return res.status(409).json({message: 'Username already in use'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        user.password = await bycrypt(password, 10)
    }
    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

const deleteUsers = asyncHandler (async (req, res) => {
    const id = req.body
    console.log('Received ID:', id);
    if( id === ""){
        return res.status(400).json({message: "User ID required"})
    }

    const notes = await Note.findOne({user: id}).lean().exec()
    if(notes){
        return res.status(400).json({message: 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message: 'User not found'})
    }
    const result = await user.deleteOne()

    const reply = `Username ${result.username} deleted`

    res.json(reply)
})

module.exports = { getAllUsers, createNewUsers, updateUser, deleteUsers }