const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const path = require('path')
const authRouter = require("./routes/auth.routes")
const fileRouter = require('./routes/file.routes')
const corsMiddleware = require('./middleware/cors.middleware')
const filePathMiddleware = require('./middleware/filePath.middleware')
const staticPathMiddleware = require('./middleware/staticPath.middleware')
const fileUpload = require("express-fileupload")

const app = express();
const PORT = process.env.PORT || config.get('serverPort')

app.use(fileUpload({}))
app.use(corsMiddleware)
app.use(filePathMiddleware(path.resolve(__dirname, 'files')))
app.use(staticPathMiddleware(path.resolve(__dirname, 'static')))
app.use(express.json())
app.use(express.static('static'))
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)

const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"))

        app.listen(PORT, () => {
            console.log("Server started on port ", PORT)
        })
    } catch(e) {
        console.log(e)
    }
}

start()