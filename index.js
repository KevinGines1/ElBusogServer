const express       = require('express')
const bodyParser    = require('body-parser')
const dotenv        = require('dotenv')
const router        = require('./router')
const database      = require('./database')
const cors          = require('cors')
const cookieParser  = require('cookie-parser')


// dotenv.config({path:'./.env'}) // set .env file path
const PORT = process.env.PORT || 5000

// initialize server
const app = express()

// middleware
// app.use(express.static('documentation'))
app.use('/', express.static('./documentation'))

// allow different origins to access the server
app.use((req,res,next)=>{
	// res.header("Access-Control-Allow-Origin", "http://localhost:3000")
	// res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Origin", "https://www.test-cors.org")
	res.header("Access-Control-Allow-Credentials", true);
	// res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')

	if(req.method === "OPTIONS"){
		// res.header("Access-Control-Allow-Origin", "http://localhost:3000")
		res.header("Access-Control-Allow-Origin", "https://www.test-cors.org")
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
		// res.header("Access-Control-Allow-Headers", "*")
		// res.header("Access-Control-Allow-Origin", "*")
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
		res.header("Access-Control-Allow-Credentials", true);
		return res.status(200).json({})
	}

	next();
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
// app.use(cors)
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
