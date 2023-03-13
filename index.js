import express from 'express';
import {getUsers} from './consultas.js'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express();

let PUERTO = process.env.PORT;


app.listen(PUERTO, () => console.log(`servidor escuchando en http://localhost:${PUERTO}`))

//ENDPOINTS
app.get("/usuarios", (req, res) => {
    getUsers().then(usuarios => {
        res.status(200).json({code: 200, data: usuarios})
    }).catch(error => {
        res.status(500).json({code: 500, message: error})
    })
})
