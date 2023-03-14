import express from 'express';
import {getUsers, addVenta } from './consultas.js'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express();

let PUERTO = process.env.PORT || 3001;


app.listen(PUERTO, () => console.log(`servidor escuchando en http://localhost:${PUERTO}`))

//ENDPOINTS
app.get("/usuarios", (req, res) => {
    getUsers().then(usuarios => {
        res.status(200).json({code: 200, data: usuarios})
    }).catch(error => {
        res.status(500).json({code: 500, message: error})
    })
})


app.post('/ventas', (req, res) => {
    let nuevaVenta = {
        id_cliente: 1,
        productos: [
            {
                id: 12,
                cantidad: 2
            },
            {
                id: 13,
                cantidad: 3
            }
        ]
    }

    addVenta(nuevaVenta).then(respuesta => {
        res.status(201).json({code: 201, data: respuesta})
    }).catch(error =>{
        res.status(500).json({code: 500, message: error})
    })


})


