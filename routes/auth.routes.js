const Router = require("express")
const {check, validationResult} = require("express-validator")
const User = require("../models/User")
const File = require("../models/File")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const authMiddleware = require("../middleware/auth.middleware")
const fileService = require("../services/fileService")

const router = new Router()

router.post('/registration', 
    [   check("firstName", "Имя пусто").isLength({min: 1}),
        check("lastName", "Фамилия пуста").isLength({min: 1}),
        check("email", "Неверный email").isEmail(),
        check("password", "Пароль должен быть длиннее 3 и короче 12").isLength({min: 3, max: 12})
    ], 
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Неверный запрос", errors})
        }

        const {firstName, lastName, email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            return res.status(400).json({message: `Пользователь с адресом электронной почты ${email} уже существует!`})
        }

        const hashPassword = await bcrypt.hash(password, 8)
        const user = new User({firstName, lastName, email, password: hashPassword})
        await user.save()
        await fileService.createDir(req, new File({user: user.id, name: ''}))
        return res.json({message: "Пользователь создан"})
    } catch(e) {
        console.log(e)
        res.send({message: 'Ошибка сервера'})
    }
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: "Пользователь не найден"})
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({message: "Неправильный пароль"})
        }

        const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
        return res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })
    } catch(e) {
        console.log(e)
        res.send({message: "Ошибка сервера"})
    }
})

router.get('/auth', authMiddleware,
    async (req, res) => {
        try {
            const user = await User.findOne({_id: req.user.id})
            const token = jwt.sign({id: user._id}, config.get("secretKey"), {expiresIn: '1h'})
            return res.json({
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Ошибка сервера"})
        }
    })

module.exports = router