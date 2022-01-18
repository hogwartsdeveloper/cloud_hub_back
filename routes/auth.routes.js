const Router = require("express")
const {check, validationResult} = require("express-validator")
const User = require("../models/User")
const bcrypt = require("bcryptjs")

const router = new Router()

router.post('/registration', 
    [   check("firstName", "First name is empty").isLength({min: 1}),
        check("lastName", "Last name is empty").isLength({min: 1}),
        check("email", "Uncorrect email").isEmail(),
        check("password", "Password must be longer than 3 and shorted than 12").isLength({min: 3, max: 12})
    ], 
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrect request", errors})
        }

        const {firstName, lastName, email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            return res.status(400).json({message: `User with email ${email} already exist`})
        }

        const hashPassword = await bcrypt.hash(password, 8)
        const user = new User({firstName, lastName, email, password: hashPassword})
        await user.save()
        return res.json({message: "User was created"})
    } catch(e) {
        console.log(e)
        res.send({message: 'Server error'})
    }
})

module.exports = router