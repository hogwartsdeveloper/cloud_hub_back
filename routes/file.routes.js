const Router = require('express')
const fileController = require('../controllers/fileController')
const authMiddleware = require('../middleware/auth.middleware')
const router = new Router()

router.post('', authMiddleware, fileController.createDir)

module.exports = router