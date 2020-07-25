const database = require('./database')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const dotenv   = require('dotenv')
const path	   = require('path')

dotenv.config({path:'./.env'})

module.exports.docs = (req,res) => { // documentation page
	//send html file containing the documentation
	res.sendFile(path.join(__dirname+'/documentation/documentation.html'))
	// res.status(200).send(documentation_page)

}

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

// module.exports.getFoodPlaceWithinRange = (req, res) => { // get food place within the specified price range
// 	//get price range from the req, should always be either of the ff: 
// 	// <60, 60-100, >100
// 	const priceRange = req.params.priceRange
// 	//create query
// 	const getFoodPlaceWithinRange = `SELECT * FROM FOOD_PLACE WHERE Price_range='${priceRange}'`
// 	//execute query
// 	database.query(getFoodPlaceWithinRange, async(err, result)=>{
// 		if(err){
// 			console.log("DATABASE GET FOOD W/IN PRICE RANGE ERR: ", err)
// 		}else{
// 			console.log(result)
// 			res.status(200).json(result)
// 		}
// 	})	
// }

// module.exports.getFoodPlaceWithFoodType = (req, res) => { // get all food places within the specified food type
// 	//get food type from the req, should always be either of the ff: 
// 	// Meat, Vegetable, Seafood, Snacks, Ice Cream
// 	const foodType = req.params.foodType
// 	//create query
// 	const getFoodPlaceWithinRange = `SELECT * FROM FOOD_PLACE WHERE Food_place_id IN (SELECT Food_place_id FROM FOOD_PLACE_FOOD WHERE Type_of_food='${foodType}')`
// 	//execute query
// 	database.query(getFoodPlaceWithinRange, async(err, result)=>{
// 		if(err){
// 			console.log("DATABASE GET FOOD W/IN PRICE RANGE ERR: ", err)
// 		}else{
// 			console.log(result)
// 			res.status(200).json(result)
// 		}
// 	})
// }

module.exports.addFoodPlace = (req, res) => { // this function should only be called when a business owner adds their food place
	//get information in the body
	const foodPlaceInfo = {
		name : req.body.foodPlaceName,
		priceRange : req.body.priceRange,
		description: req.body.description,
		openTime: req.body.openTime, 
		closeTime: req.body.closeTime, 
		daysOpen : req.body.daysOpen,
		foodTypes : req.body.foodTypes // string
		owner: req.body.owner // username of the owner
	}

	//create query
	const addFoodPlaceQuery = `INSERT INTO FOOD_PLACE(Food_place_name, Price_range, Description, Opening_time, Closing_time, Days_open, Food_types, User_id) VALUES ("${foodPlaceInfo.name}", "${foodPlaceInfo.priceRange}", "${foodPlaceInfo.description}", ${foodPlaceInfo.openTime}, ${foodPlaceInfo.closeTime}, "${foodPlaceInfo.daysOpen}", "${foodPlaceInfo.foodTypes}", (SELECT User_id from USER where Username="${foodPlaceInfo.owner}"))`

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

module.exports.getOwnFoodPlace = (req, res) => { // display foodplaces owned by a Business_owner user
	// get userID from params
	const userID = req.params.userID

	//create query
	const getOwnFoodPlaceQuery = `SELECT * FROM FOOD_PLACE WHERE User_id=${userID}`

	//execute query
	database.query(getOwnFoodPlaceQuery, (err, result)=>{
		if(err){
			console.log("DATABASE GET OWNED FOOD PLACE ERR: ", err)
		}else{
			res.status(200).json(result)
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

module.exports.checkUsername = (req, res) => { // invoke this function when a user is inputing username when creating an account
	// get username from request
	const username = req.body.username

	//create query 
	const checkUsernameQuery = `SELECT Username from USER WHERE Username = '${username}'`
	//execute query
	database.query(checkUsernameQuery, (err, result)=>{
		if(err){
			console.log("CHECK USERNAME IN DB ERR: ", err)
		}else{
			if(result.length === 0){
				res.status(200).json({infoValid: true, msg:"Username is valid!"})
			}else{
				res.status(200).json({infoValid: false, msg:"Username is already taken!"})
			}
		}
	})
}

module.exports.checkEmail = (req, res) => { // invoke this function when a user is inputing email when creating an account
	// get email from request
	const email = req.body.email

	//create query 
	const checkEmailQuery = `SELECT Email from USER WHERE email = '${email}'`
	//execute query
	database.query(checkEmailQuery, (err, result)=>{
		if(err){
			console.log("CHECK USERNAME IN DB ERR: ", err)
		}else{
			if(result.length === 0){
				res.status(200).json({infoValid: true, msg:"Email is valid!"})
			}else{
				res.status(200).json({infoValid: false, msg:"Email is already taken!"})
			}
		}
	})
}

module.exports.createAccount = async (req, res) => { // creating a customer/business owner account
	// invoke this function only when the username and email have been validated
	// get info from the request
	const userInfo = {
		name : req.body.name,
		username : req.body.username,
		email : req.body.email,
		password: req.body.password,
		picture: req.body.picture, // if none is passed, request should make the value of this as "NULL"
		type: req.body.type // value should only be "Customer" or "Business_owner"
	}

	let userPW = await bcrypt.hash(userInfo.password, 8) // encrypting for security
	// add account to db
	if(userInfo.picture === "NULL"){
		const addUserToDBQuery = `INSERT INTO USER(Name, Username, Email, Password,  User_type) VALUES ('${userInfo.name}','${userInfo.username}', '${userInfo.email}', '${userPW}', '${userInfo.type}')`
		database.query(addUserToDBQuery, (err, result)=>{
			if(err){
				console.log("ADD USER TO DB ERR: ", err)
			}else{
				res.status(200).json({msg:"Successfully added user!"})
			}
		})
	}else{
		const addUserToDBQuery = `INSERT INTO USER(Name, Username, Email, Password, Picture,  User_type) VALUES ('${userInfo.name}','${userInfo.username}', '${userInfo.email}', '${userPW}', '${userInfo.picture}', '${userInfo.type}')`
		database.query(addUserToDBQuery, (err, result)=>{
			if(err){
				console.log("ADD USER TO DB ERR: ", err)
			}else{
				res.status(200).json({msg:"Successfully added user!"})
			}
		})
	}
}

module.exports.deleteAccountCustomer = (req, res) => { // to delete an account in the db; before invoking this function, make sure the user really wants to delete his/her account
	// get username from params
	const username = req.params.username

	// MAKE SURE THAT THE ACCOUNT TYPE IS "Customer" !!!!
	//create query
	const deleteAccQuery = `DELETE FROM USER WHERE Username='${username}'`
	//execute query
	database.query(deleteAccQuery, (err, result)=>{
		if(err){
			console.log("DELETE ACC IN DB ERR: ", err)
		}else{
			console.log(result)
			res.status(200).json({msg: "Successfully removed account!"})
		}
	})

}

module.exports.getProfile = (req, res) => { // get the information of a user; invoke this only when user is logged in
	// get username from parameters
	const username = req.params.username

	// create query
	const getUserInfo = `SELECT * FROM USER WHERE Username='${username}'`
	// execute query
	database.query(getUserInfo, (err, result)=>{
		if(err){
			console.log("GET USER INFO FROM DB ERR: ", err)
		}else{
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


