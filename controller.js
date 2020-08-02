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
		location: req.body.location,
		priceRange : req.body.priceRange,
		description: req.body.description,
		openTime: req.body.openTime, 
		closeTime: req.body.closeTime, 
		daysOpen : req.body.daysOpen,
		foodTypes : req.body.foodTypes, // string
		owner: req.body.owner // username of the owner
	}

	//create query
	const addFoodPlaceQuery = `INSERT INTO FOOD_PLACE(Food_place_name, Location, Price_range, Description, Opening_time, Closing_time, Days_open, Food_types, User_id) VALUES ("${foodPlaceInfo.name}", "${foodPlaceInfo.location}",${foodPlaceInfo.priceRange}", "${foodPlaceInfo.description}", ${foodPlaceInfo.openTime}, ${foodPlaceInfo.closeTime}, "${foodPlaceInfo.daysOpen}", "${foodPlaceInfo.foodTypes}", (SELECT User_id from USER where Username="${foodPlaceInfo.owner}"))`

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

module.exports.deleteComments = (req,res) =>{			//child table is fine to delete items
	//input for query
	const commentsInfo = {
		userID : req.body.userID,
		foodPlaceID : req.body.foodPlaceID,
		rating : req.body.rating,
		comment : req.body.comment,
	}
	//query here
	const removeCommentsAndRatingQuery = 'DELETE FROM RATES_COMMENTS WHERE User_id = ? AND Food_place_id = ? AND Rating = ? AND Comment = ?'
	//executes here
	database.query(removeCommentsAndRatingQuery, [commentsInfo.userID, commentsInfo.foodPlaceID, commentsInfo.rating, 

commentsInfo.comment], function(error, results, fields){
		if(results.length != 0){
			//successful delete
			res.status(200).json({msg: "Successfully deleted an item!"})
		}else{
			//failed to delete
			res.send("Please check the inputs")
			console.log("Did not catch one/more of the primary keys")
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
				res.status(200).json({infoValid: true, msg:"Username is available!"})
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
				res.status(200).json({infoValid: true, msg:"Email is available!"})
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

module.exports.loginUser = (req,res) =>{ // login user to website
	//user input 
	const checkName = req.body.username
	const checkPassword = req.body.password
	if(checkName && checkPassword){ // check if username and password exists
		// database.query('SELECT * FROM USER WHERE Username = ? AND Password = ?', [checkName, checkPassword], function(error, results, fields){
		database.query('SELECT * FROM USER WHERE Username = ?', [checkName], async(error, results)=>{
				console.log("RESULTS: ",results)
			if(results.length !== 0){
				let comparePWToHash = await bcrypt.compare(checkPassword, results[0].Password)
				if(comparePWToHash){
				// if(checkPassword === results[0].Password){
					//logged in
					// req.session.loggedin = true
					res.status(200).json({ authorized: true, msg: "Successfully logged in!"})
				}
			}else{
				//incorrect username or password
				res.send({authorized: false, msg:"Please check the Username and/or Password"})
				console.log("Not in the database")
			}
		})
	}else{
		//no inputs
		console.log("Caught no username or password")
		res.send("Please enter the username and password in the fields")
	}
}


module.exports.deleteAccountCustomer = (req,res) =>{	//Delete commentsAndRatings first before user 
	//input
	const username = req.params.username
	//execute query here: Rates and Comments Delete
	database.query(`DELETE FROM RATES_COMMENTS WHERE User_id=(SELECT User_id FROM USER WHERE Username = '${username}')`, (err, result) =>{
		if(err){
			console.log("DELETE Comments IN DB ERR: ", err)
		}else{
			//execute query here: Customer Delete 2nd part
			console.log(result)
			database.query(`DELETE FROM USER WHERE Username = '${username}'`, (err, result)=>{
				if(err){
					console.log("DELETE ACC IN DB ERR: ", err)
				}else{
					console.log(result)
					res.status(200).json({msg: "Successfully removed account!"})
				}
			})
		}
	})
}

module.exports.deleteBusinessOwner = (req,res) =>{		//Works with delete cascade
	//input
	// const foodPlaceId = req.body.foodPlaceId
	const username = req.params.username
	//query here
	const deleteBusinessOwnerQuery = `DELETE FROM USER WHERE Username = '${username}'`
	//executes here
	database.query(deleteBusinessOwnerQuery, function(error, results, fields){
		console.log("results: ",results)
		if(results.length !==0){
			//successful delete
			res.status(200).json({msg: "Successfully deleted a Business Owner!"})
		}else{
			//fails to delete
			res.send("Please check the IDs")
			console.log("Incomplete Parameters")
		}
	})
}

module.exports.getProfile = (req, res) => { // get the information of a user; invoke this only when user is logged in
	// get username from parameters
	const username = req.params.username

	// create query
	const getUserInfo = `SELECT User_id, Name, Username, Email, Picture, User_type FROM USER WHERE Username='${username}'`
	// execute query
	database.query(getUserInfo, (err, result)=>{
		if(err){
			console.log("GET USER INFO FROM DB ERR: ", err)
		}else{
			res.status(200).json(result)
		}
	})
}


module.exports.updateAccountInfo = async (req,res) =>{
	//input 
	const userID = req.body.userID
	const username = req.body.origUsername
	const updateInfo = {		//Null for no changes
		name : req.body.newName,
		username : req.body.newUsername,
		email : req.body.newEmail, 
		password : req.body.newPassword,
		picture : req.body.newPicturePath,
	}

	if(updateInfo.username){
		//check in database if it's unique
		database.query('SELECT * FROM USER WHERE Username = ?', [updateInfo.username], function(error, results, fields){
			if(results.length===0){
				//usernameNew is unique
				database.query(`UPDATE USER SET Username = '${updateInfo.username}' WHERE Username = '${username}'`)
				console.log("Updated Username")
				// res.status(200).json({msg:"Successfully updated username!"})
			}else{
				//return
				console.log("Username not unique")
				return res.send("Please use another Username")
				// return 						//early return?
			}
		})
	}
	if(updateInfo.email){
		//check in database if it's unique
		database.query('SELECT * FROM USER WHERE Email = ?', [updateInfo.email], function(error, results, fields){
			if(results.length==0){
				//email is unique
				database.query(`UPDATE USER SET Email = '${updateInfo.email}' WHERE Username = '${username}'`)
				console.log("Updated Email")
				// res.status(200).json({msg:"Successfully updated email!"})
			}else{
				//return
				console.log("Email not unique")
				return res.send("Please use another email ")
				// return 						//early return?
			}
		})
	}

	//possible changes for Name, Password, Picture not sure how to make it efficient lmao; will not check if user puts the same inputs
	if(updateInfo.name){
		database.query(`UPDATE USER SET Name = '${updateInfo.name}' WHERE Username = '${username}'`)
		console.log("Updated Name")
		// res.status(200).json({msg:"Successfully updated name!"})
	}
	if(updateInfo.password){
		let userPW = await bcrypt.hash(updateInfo.password, 8)
		database.query(`UPDATE USER SET Password = '${userPW}' WHERE Username = '${username}'`)
		console.log("Updated Password")
		// res.status(200).json({msg:"Successfully updated password!"})
	}
	if(updateInfo.picture){
		database.query(`UPDATE USER SET Picture = '${updateInfo.picture}' WHERE Username = '${username}'`)
		console.log("Updated Picture")
		// res.status(200).json({msg:"Successfully updated picture!"})
	}

	database.query(`SELECT * FROM USER WHERE User_id = ${userID}`, (err, result)=>{
		if(err){
			console.log("UPDATE PROFILE INFO ERR IN DB: ", err)
		}else{
			console.log("NEW DATA: ", result)
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



