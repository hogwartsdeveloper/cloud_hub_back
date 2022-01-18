const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const authRouter = require("./routes/auth.routes")
const corsMiddleware = require('./middleware/cors.middleware')

const app = express();
const PORT = process.env.PORT || config.get('serverPort')

app.use(corsMiddleware)
app.use(express.json())
app.use("/api/auth", authRouter)


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