import pkg from 'pg';
const {Pool} = pkg;
import * as dotenv from 'dotenv'
import { throws } from 'assert';
dotenv.config()

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
})

export const getUsers = () => {
    return new Promise( async (resolve, reject) => {
        try {
            let usuarios = await pool.query("SELECT id, nombres, apellidos, email from clientes");
            return resolve(usuarios.rows)
        } catch (error) {
            console.log(error)
            return reject("Error al buscar los usuarios");
        }
    })
}


/* PASO 1: CONOCER EL ID DEL CLIENTE
PASO 2: GENERAR LA VENTA VINCULANDO CON EL ID DEL CLIENTE
PASO 3: CONOCER LOS PRODUCTOS Y CANTIDAD A COMPRAR
PASO 4: INGRESAMOS LOS DETALLES DE LA VENTA
PASO 5: DESCONTAR LOS STOCK:

COMMIT O ROLLBACK */

export const addVenta = (nuevaVenta) => {
    return new Promise( async (resolve, reject) => {
        try {
            //INICIA LA TRANSACCIÓN
            await pool.query("BEGIN")
            //PASO 1: CONOCER EL ID DEL CLIENTE
            let id_cliente = nuevaVenta.id_cliente;
            //NOS ASEGURAMOS DE VER SI CLIENTE EXISTE EN LA BASE DE DATOS.
            let cliente = await pool.query("SELECT id, nombres, apellidos, email FROM clientes WHERE id =$1", [id_cliente])
            if(cliente.rows.length==0) throw new Error("Cliente no existe en la base de datos.")

            //PASO 2: GENERAR LA VENTA VINCULANDO CON EL ID DEL CLIENTE
            let venta = await pool.query("INSERT INTO ventas (fecha, cliente_id) VALUES (now(), $1) RETURNING *", [id_cliente]);

            let idVenta = venta.rows[0].id;

            //PASO 3: CONOCER LOS PRODUCTOS Y CANTIDAD A COMPRAR
            nuevaVenta.productos.forEach(async (producto) => {
                let productoBuscado = await pool.query("SELECT * FROM productos WHERE id=$1", [producto.id_producto])
                let precioFinal = productoBuscado.precio - productoBuscado.descuento;
                //PASO 4: INGRESAMOS LOS DETALLES DE LA VENTA
                await pool.query("INSERT INTO detalle_ventas(cantidad, precio, venta_id, producto_id) VALUES ($1, $2, $3, $4)", [producto.cantidad, precioFinal, idVenta, producto.id_producto]);
                
                //PASO 5: DESCONTAR LOS STOCK:
                await pool.query("UPDATE productos SET stock = stock - $1", [producto.cantidad])
            });

            pool.query("COMMIT")
            return resolve("Venta generada con éxito")
        } catch (error) {
            console.log(error)
            await pool.query('ROLLBACK')
            return reject("No se puedo concretar la venta.")

        }
    })
}