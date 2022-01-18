const express = require('express')
const config = require('config')
const mongoose = require('mongoose')

const app = express();
const PORT = process.env.PORT || config.get('serverPort')


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