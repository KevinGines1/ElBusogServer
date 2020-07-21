const express       = require('express')
const bodyParser    = require('body-parser')
const dotenv        = require('dotenv')
const router        = require('./router')
const database      = require('./database')
const cors          = require('cors')
const cookieParser  = require('cookie-parser')


dotenv.config({path:'./.env'}) // set .env file path
const PORT = process.env.PORT

// initialize server
const app = express()

// middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
// app.use(cors({
//     origin:[
//         'http://localhost:3000'
//     ],
//     credentials:true
// }))
app.use(cookieParser())


// pass this app to router
router(app)

//connect to mySQL
database.connect(err => {
    if(err){
        console.log(err)
    }else{
        console.log('MySQL connected')
    }
})

// set port to listen to
app.listen(PORT, ()=>{
    console.log(`Server up listening at ${PORT}`)
})
