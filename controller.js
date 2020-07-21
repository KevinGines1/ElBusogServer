const database = require('./database')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const dotenv   = require('dotenv')

dotenv.config({path:'./.env'})

module.exports.getAllFoodPlaces = (req,res) => {

	//create query
	const getAllFoodPlacesQuery = `SELECT * FROM FOOD_PLACE`
	database.query(getAllFoodPlacesQuery, async(err, result) => {
		if(err){
			console.log("DATABASE GET ALL FOOD QUERY ERR: ", err)
		}else{
			console.log(result)
			// return res.status(200).send(result)
		}
	})
}

module.exports.showAllUsers = (req, res) => { // dummy function, not useful for actual app
	//create query
	const getAllUsersQuery = `SELECT * FROM USER`
	//execute query
	database.query(getAllUsersQuery, async(err, result) => {
		if(err){
			console.log("DATABASE GET ALL USERS QUERY ERR: ", err)
		}else{
			console.log(result)
			return res.status(200).send(result)
		}
	})
}

module.exports.home = (req,res) =>{
	return res.send("<p>Hello World</p>")
}