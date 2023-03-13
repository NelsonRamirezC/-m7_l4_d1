import pkg from 'pg';
const {Pool} = pkg;
import * as dotenv from 'dotenv'
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
