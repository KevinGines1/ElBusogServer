const mySQL     = require('mysql')
const dotenv    = require('dotenv')

dotenv.config({path: './.env'})

const connection = mySQL.createConnection({
    host: process.env.DATABASE_HOST,
    user:process.env.DATABASE_USERNAME,
    password:process.env.DATABASE_PW,
    database:process.env.DATABASE,
})

module.exports = connection
