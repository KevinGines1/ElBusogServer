const database = require('./database')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const dotenv   = require('dotenv')

dotenv.config({path:'./.env'})

module.exports.getAllFoodPlaces = (req,res) => { // get all food places in the database
	
	//create query
	const getAllFoodPlacesQuery = `SELECT * FROM FOOD_PLACE`
	database.query(getAllFoodPlacesQuery, async(err, result) => {
		if(err){
			console.log("DATABASE GET ALL FOOD QUERY ERR: ", err)
		}else{
			console.log(result)
			// return res.status(200).json(result)
			res.status(200).json(result)
		}
	})
}

module.exports.getFoodPlaceWithinRange = (req, res) => { // get food place within the specified price range
	//get price range from the req, should always be either of the ff: 
	// <60, 60-100, >100
	const priceRange = req.params.priceRange
	//create query
	const getFoodPlaceWithinRange = `SELECT * FROM FOOD_PLACE WHERE Price_range='${priceRange}'`
	//execute query
	database.query(getFoodPlaceWithinRange, async(err, result)=>{
		if(err){
			console.log("DATABASE GET FOOD W/IN PRICE RANGE ERR: ", err)
		}else{
			console.log(result)
			res.status(200).json(result)
		}
	})	
}

module.exports.getFoodPlaceWithFoodType = (req, res) => { // get all food places within the specified food type
	//get food type from the req, should always be either of the ff: 
	// Meat, Vegetable, Seafood, Snacks, Ice Cream
	const foodType = req.params.foodType
	//create query
	const getFoodPlaceWithinRange = `SELECT * FROM FOOD_PLACE WHERE Food_place_id IN (SELECT Food_place_id FROM FOOD_PLACE_FOOD WHERE Type_of_food='${foodType}')`
	//execute query
	database.query(getFoodPlaceWithinRange, async(err, result)=>{
		if(err){
			console.log("DATABASE GET FOOD W/IN PRICE RANGE ERR: ", err)
		}else{
			console.log(result)
			res.status(200).json(result)
		}
	})
}

module.exports.addFoodPlace = (req, res) => { // this function should only be called when a business owner adds their food place
	//get information in the body
	const foodPlaceInfo = {
		name : req.body.foodPlaceName,
		priceRange : req.body.priceRange,
		description: req.body.description,
		openTime: req.body.openTime, // TIME IS IN 24-HR FORMAT
		closeTime: req.body.closeTime, // TIME IS IN 24-HR FORMAT
		daysOpen : req.body.daysOpen,
		owner: req.body.owner // username of the owner
	}

	//create query
	const addFoodPlaceQuery = `INSERT INTO FOOD_PLACE(Food_place_name, Price_range, Description, Opening_time, Closing_time, Days_open,User_id) VALUES ("${foodPlaceInfo.name}", "${foodPlaceInfo.priceRange}", "${foodPlaceInfo.description}", TIME_FORMAT("${foodPlaceInfo.openTime}", "%T"), TIME_FORMAT("${foodPlaceInfo.closeTime}", "%T"), "${foodPlaceInfo.daysOpen}", (SELECT User_id from USER where Username="${foodPlaceInfo.owner}"))`

	//execute query
	database.query(addFoodPlaceQuery, async(err, result)=>{
		if(err){
			console.log("DATABASE ADD FOOD PLACE ERR: ", err)
		}else{
			// console.log(result)
			res.status(200).json({msg: "Successfully added new food place!"})
		}
	})
}

module.exports.deleteFoodPlace = (req, res) => { // this function should only be called when a business owner wants to delete their food place from the site
	// get food place information from params
	const foodPlaceId = req.params.foodPlaceId

	//create query
	const removeFoodPlaceQuery = `DELETE FROM FOOD_PLACE WHERE Food_place_id=${foodPlaceId}`

	//execute query
	database.query(removeFoodPlaceQuery, (err, result)=>{
		if(err){
			console.log("DATABASE DELETE FOOD PLACE ERR: ", err)
		}else{
			res.status(200).json({msg: "Successfully removed food place!"})
		}
	})

}

module.exports.addComment = (req, res) => { // this function should only be called when a CUSTOMER account adds a rating and a comment to a food place
	// get input from user
	const ratingInfo = {
		userId : req.body.userID,
		foodPlaceId : req.body.foodPlaceId,
		rating : req.body.rating, // value should only be 1-5 (star rating)
		comment : req.body.comment
	}

	//create query
	const addRatingAndCommentQuery = `INSERT INTO RATES_COMMENTS(User_id, Food_place_id, Rating, Comment, Date_posted) VALUES ('${ratingInfo.userId}', '${ratingInfo.foodPlaceId}','${ratingInfo.rating}', '${ratingInfo.comment}', CURDATE())`

	//execute query
	database.query(addRatingAndCommentQuery, (err, result)=>{
		if(err){
			console.log("ADD COMMENT ERROR: ", err)
		}else{
			res.status(200).json({msg: "successfully added comment!"})
		}
	})
}

module.exports.getComments = (req,res) => { // get comments  and ratings from a particular food place
	//get food place id from url
	const foodPlaceId = req.params.foodPlaceId

	//create query
	const getCommentsQuery = `SELECT * FROM RATES_COMMENTS WHERE Food_place_id=${foodPlaceId}`

	//execute query
	database.query(getCommentsQuery, (err,result) =>{
		if(err){
			console.log("GET COMMENTS DB ERR: ", err)
		}else{
			console.log(result)
			res.status(200).json(result)
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
			// return res.status(200).json(result)
			res.status(200).json(result)
		}
	})
}


module.exports.home = (req,res) =>{
	return res.send("<p>Hello World</p>")
}