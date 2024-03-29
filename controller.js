const database = require('./database')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const dotenv   = require('dotenv')
const path	   = require('path')

dotenv.config({path:'./.env'})


// *************************************************** LANDING PAGE ***************************************************

module.exports.docs = (req,res) => { // documentation page
	//send html file containing the documentation
	res.sendFile(path.join(__dirname+'/documentation/documentation.html'))
	// res.status(200).send(documentation_page)

}

// *************************************************** GET FROM DB ***************************************************

module.exports.getAllFoodPlaces = (req,res) => { // get all food places in the database
	
	//create query
	const getAllFoodPlacesQuery = `SELECT * FROM FOOD_PLACE`
	database.query(getAllFoodPlacesQuery, async(err, result) => {
		if(err){
			console.log("DATABASE GET ALL FOOD QUERY ERR: ", err)
		}else{
			// console.log(result)
			// return res.status(200).json(result)
			res.status(200).json(result)
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
			// console.log(result)
			res.status(200).json(result)
		}
	})
}

module.exports.getProfile = (req, res) => { // get the information of a user; invoke this only when user is logged in
	// get username from parameters
	const userID = req.params.userID

	// create query
	const getUserInfo = `SELECT User_id, Name, Username, Email, Picture, User_type FROM USER WHERE User_id=${userID}`
	// execute query
	database.query(getUserInfo, (err, result)=>{
		if(err){
			console.log("GET USER INFO FROM DB ERR: ", err)
		}else{
			res.status(200).json(result)
		}
	})
}

module.exports.getFoodPlacePhotos = (req,res) =>{
	const foodPlaceID = req.params.foodPlaceID

	//construct query
	const getPhotosQuery = `SELECT * from FOOD_PLACE_PICTURES WHERE Food_place_id=${foodPlaceID}`

	database.query(getPhotosQuery, (err, result)=>{
		if(err){
			console.log("GET PHOTOS FROM DB ERR: ", err)
			throw new Error("GET PHOTOS ERROR IN DB: ", err)
		}else{
			// console.log(result)
			res.status(200).json(result)
		}
	})
}

module.exports.getJeepneyStop = (req, res) => {
	var jeepneyStopName = null
	var jeepneyStartName = null

	const foodPlaceID = req.params.foodPlaceID
	const userLat = req.params.latitude
	const userLng = req.params.longitude

	radians = (degrees) => {
    	return(degrees * Math.PI / 180);
	}

	var userLngRad = radians(userLng)
	var userLatRad = radians(userLat)

		//query here
	const getFoodPlaceQuery = `SELECT * FROM FOOD_PLACE WHERE Food_place_id = ${foodPlaceID}`
	//execute query
	database.query(getFoodPlaceQuery, (err,result)=>{
		if(err){
			console.log(err)			//ID might be wrong
		}else{
			foodPlaceLng = Number(result[0].Longitude)
			foodPlaceLat = Number(result[0].Latitude)

			// foodPlaceLat1 = foodPlaceLat
			// foodPlaceLng1 = foodPlaceLng

			foodPlaceLngRad = radians(foodPlaceLng)
			foodPlaceLatRad = radians(foodPlaceLat)
		}

		//Jeep Start and Stop
		haversineFxn = (sampleLngRad, sampleLatRad) =>{
			// database of jeepney stops
			jeepneyStops = [
			    {
			        'stop_ID': 1,
			        'stop_name': "UPLB Gate",
			        'stop_lat': 14.167677,
			        'stop_lng': 121.243023
			    },
			    {
			        'stop_ID': 2,
			        'stop_name': "Raymundo Gate",
			        'stop_lat': 14.167805,
			        'stop_lng': 121.241542
			    },
			    {
			        'stop_ID': 3,
			        'stop_name': "Women's Dorm",
			        'stop_lat': 14.161289,
			        'stop_lng': 121.240902
			    },
			    {
			        'stop_ID': 4,
			        'stop_name': "Animal Sciences Building",
			        'stop_lat': 14.159885,
			        'stop_lng': 121.243542
			    },
			    {
			        'stop_ID': 5,
			        'stop_name': "F.O. Santos",
			        'stop_lat': 14.169886,
			        'stop_lng': 121.244062
			    },
			    {
			        'stop_ID': 6,
			        'stop_name': "Demarses",
			        'stop_lat': 14.169015,
			        'stop_lng': 121.244294
			    },
			    {
			        'stop_ID': 7,
			        'stop_name': "Grove (Near Jollibee)",
			        'stop_lat': 14.168446,
			        'stop_lng': 121.244008
			    },
			    {
			        'stop_ID': 8,
			        'stop_name': "Landbank",
			        'stop_lat': 14.167043,
			        'stop_lng': 121.243690
			    },
			    {
			        'stop_ID': 9,
			        'stop_name': "Math Building",
			        'stop_lat': 14.165094,
			        'stop_lng': 121.244564
			    },
			    {
			        'stop_ID': 10,
			        'stop_name': "DL Umali",
			        'stop_lat': 14.163731,
			        'stop_lng': 121.239964
			    },
			    {
			        'stop_ID': 11,
			        'stop_name': "Baker Hall",
			        'stop_lat': 14.161323,
			        'stop_lng': 121.242573
			    }
			]

			const r = 6373.0                    //this is the radius of the Earth and will be used for distance calculation
			var jeepneyName = null          //the name of the closest jeepney stop
			var jeepneyDistance = null      //the distance of the closest jeepney stop

			jeepneyStops.forEach((current)=>{
				lngRad = radians(current.stop_lng)
				latRad = radians(current.stop_lat)

				diffLng = lngRad - sampleLngRad
				diffLat = latRad - sampleLatRad

				a = Math.sin(diffLat / 2)**2 + Math.cos(sampleLatRad) * Math.cos(latRad) * Math.sin(diffLng / 2)**2;
				c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 -a));
			    distance = r * c * 1000;        //distance in meters

			    // compare the distance with the closest recorded distance
			    if(jeepneyDistance === null || jeepneyDistance > distance) {
			        jeepneyName = current.stop_name
			        jeepneyDistance = distance;
			    }
			})
			return(jeepneyName)
		}
		jeepStopName = haversineFxn(foodPlaceLngRad, foodPlaceLatRad)
		jeepStartName = haversineFxn(userLngRad, userLatRad)
		//RouteCheck
		direction= (Ax, Ay, Bx, By, Cx, Cy)=>{
			//Makes point A the origin

			dBx= Bx-Ax
			dBy= By-Ay			

			dCx= Cx-Ax
			dCy= Cy-Ay

			crossProduct= dBx*dCy-dBy*dCx
			if(crossProduct > 0){
				return "Kanan"
			}else if(crossProduct < 0){
				return "Kaliwa"
			}else{
				return ("Kanan/Kaliwa")			//is on the line, so maybe straight ahead or something
			}
		}

		Ax = 14.167455			//UPLB Gate-Origin
		Ay = 121.243357

		Bx = foodPlaceLat
		By = foodPlaceLng

		Cx = userLat
		Cy = userLng

		route = direction(Ax,Ay,Bx,By,Cx,Cy)

		routeObject = {
			'route' : route,
			'rideStart' : jeepStartName,
			'rideStop' 	: jeepStopName
		}
		res.status(200).json(routeObject)
	})
}

// *************************************************** ADD TO DB ***************************************************

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
		owner: req.body.owner, // username of the owner
		latitude: req.body.latitude,
		longitude : req.body.longitude
	}

	//create query
	const addFoodPlaceQuery = `INSERT INTO FOOD_PLACE(Food_place_name, Location, Price_range, Description, Opening_time, Closing_time, Days_open, Food_types, Longitude, Latitude, User_id) VALUES ("${foodPlaceInfo.name}", "${foodPlaceInfo.location}","${foodPlaceInfo.priceRange}", "${foodPlaceInfo.description}", "${foodPlaceInfo.openTime}", "${foodPlaceInfo.closeTime}", "${foodPlaceInfo.daysOpen}", "${foodPlaceInfo.foodTypes}", ${foodPlaceInfo.longitude}, ${foodPlaceInfo.latitude}, (SELECT User_id from USER where Username="${foodPlaceInfo.owner}"))`

	const addFoodPlaceQuery24H = `INSERT INTO FOOD_PLACE(Food_place_name, Location, Price_range, Description, Opening_time, Closing_time, Days_open, Food_types, Longitude, Latitude, User_id) VALUES ("${foodPlaceInfo.name}", "${foodPlaceInfo.location}","${foodPlaceInfo.priceRange}", "${foodPlaceInfo.description}", NULL, NULL, "${foodPlaceInfo.daysOpen}", "${foodPlaceInfo.foodTypes}", ${foodPlaceInfo.longitude}, ${foodPlaceInfo.latitude}, (SELECT User_id from USER where Username="${foodPlaceInfo.owner}"))`

	//execute query

	if(foodPlaceInfo.openTime === null || foodPlaceInfo.closeTime === null || foodPlaceInfo.closeTime === "null" || foodPlaceInfo.openTime === "null"){
		database.query(addFoodPlaceQuery24H, async(err, result)=>{
			if(err){
				console.log("DATABASE ADD FOOD PLACE ERR: ", err)
				throw new Error("DATABASE ADD FOOD PLACE ERR: (OUTER)", err)
			}else{
				// console.log(result)
				database.query(`SELECT Food_place_id FROM FOOD_PLACE WHERE Food_place_name="${foodPlaceInfo.name}"`, (err1, result1)=>{
					if(err1){
						console.log("DATABASE ADD FOOD PLACE ERR: ", err1)
						throw new Error("DATABASE ADD FOOD PLACE ERR: (OUTER)", err1)
					}else{
						console.log(result1)
						res.status(200).json(result1)
					}
				})
			}
		})
	}else{
		database.query(addFoodPlaceQuery, async(err, result)=>{
			if(err){
				console.log("DATABASE ADD FOOD PLACE ERR: ", err)
				throw new Error("DATABASE ADD FOOD PLACE ERR: (OUTER)", err)
			}else{
				// console.log(result)
				database.query(`SELECT Food_place_id FROM FOOD_PLACE WHERE Food_place_name="${foodPlaceInfo.name}"`, (err1, result1)=>{
					if(err1){
						console.log("DATABASE ADD FOOD PLACE ERR: ", err1)
						throw new Error("DATABASE ADD FOOD PLACE ERR: (OUTER)", err1)
					}else{
						console.log(result1)
						res.status(200).json(result1)
					}
				})
			}
		})
	}
}

module.exports.addFoodPlacePhoto = (req,res) =>{
	// add a single path for a specific food place, make sure that this can be displayed when placed in the src of an img

	//get food place id
	const foodPlaceID = Number (req.body.foodPlaceID)
	const photoPath = req.body.foodPlacePhoto

	//create query
	const addPhotoToDBQuery = `INSERT INTO FOOD_PLACE_PICTURES(Food_place_id, Picture) VALUES (${foodPlaceID} , "${photoPath}")`

	database.query(addPhotoToDBQuery, (err, result)=>{
		if(err){
			console.log(err)
			throw new Error("ADD PHOTOS TO DB ERR: ", err)
		}else{
			// console.log(result)
			res.status(200).json({msg: "Successfully added photo!"})
		}
	})
}

module.exports.addComment = (req, res) => { // this function should only be called when a CUSTOMER account adds a rating and a comment to a food place
	// get input from user
	const ratingInfo = {
		userId : req.body.userID,
		foodPlaceId : req.body.foodPlaceID,
		rating : req.body.rating, // value should only be 1-5 (star rating)
		comment : req.body.comment
	}

	//create query
	const addRatingAndCommentQuery = `INSERT INTO RATES_COMMENTS(User_id, Username, Food_place_id, Rating, Comment, Date_posted) VALUES ('${ratingInfo.userId}', (SELECT Username FROM USER WHERE User_id=${ratingInfo.userId}), '${ratingInfo.foodPlaceId}','${ratingInfo.rating}', '${ratingInfo.comment}', CURDATE())`

	//execute query
	database.query(addRatingAndCommentQuery, (err, result)=>{
		if(err){
			console.log("ADD COMMENT ERROR: ", err)
		}else{
			res.status(200).json({msg: "successfully added comment!"})
		}
	})
}

module.exports.createAccount = async (req, res) => { // creating a customer/business owner account
	// invoke this function only when the username and email have been validated
	// get info from the request
	const userInfo = {
		name : req.body.Name,
		username : req.body.Username,
		email : req.body.Email,
		password: req.body.Password,
		picture: req.body.Picture, // if none is passed, request should make the value of this as "NULL"
		type: req.body.User_type // value should only be "Customer" or "Business_owner"
	}

	let userPW = await bcrypt.hash(userInfo.password, 8) // encrypting for security
	// add account to db
	const addUserToDBQuery = `INSERT INTO USER(Name, Username, Email, Password, Picture,  User_type) VALUES ("${userInfo.name}","${userInfo.username}", "${userInfo.email}", "${userPW}", "${userInfo.picture}", "${userInfo.type}")`
	database.query(addUserToDBQuery, (err, result)=>{
		if(err){
			console.log("ADD USER TO DB ERR: ", err)
			throw new Error("ADD USER TO DB ERR: ", err)
		}else{

			const getNewUserFrDBQuery = `SELECT * FROM USER WHERE Username='${userInfo.username}'`
			database.query(getNewUserFrDBQuery, (err, result1)=>{
				if(err){
					console.log("GET NEW USER FR DB ERR: ", err)
					throw new Error("GET NEW USER FR DB ERR: ", err)
				}else{
				const token = jwt.sign({
					id : result1[0].User_id}, process.env.TOKEN_SECRET, {expiresIn: process.env.TOKEN_EXPIRY})
				res.status(200).json({msg:"Successfully added user!", token})
				}
			})
		}
	})
}

// *************************************************** DELETE FROM DB ***************************************************

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

module.exports.deleteComments = (req,res) =>{			//child table is fine to delete items
	//input for query
	console.log("JAI HERE1: ", req.body)
	console.log("REQUEST: ", req)
	const commentsInfo = {
		userID : req.body.userID,
		foodPlaceID : req.body.foodPlaceID,
		rating : req.body.rating,
		comment : req.body.comment,
	}
	//query here
	const removeCommentsAndRatingQuery = `DELETE FROM RATES_COMMENTS WHERE User_id = ${commentsInfo.userID} AND Food_place_id = ${commentsInfo.foodPlaceID} AND Rating = ${commentsInfo.rating} AND Comment = "${commentsInfo.comment}"`
	//executes here
	console.log(removeCommentsAndRatingQuery)
	database.query(removeCommentsAndRatingQuery, (error, results)=>{
		if(error){
			//failed to delete
			// res.send("Please check the inputs")
			// console.log("Did not catch one/more of the primary keys")
			console.log("DELETE COMMENT IN DB ERROR: ", error)
			throw new Error("DELETE COMMEINT IN DB ERROR: ", error)
		}else{
			//successful delete
			res.status(200).json({msg: "Successfully deleted an item!"})
		}
	})
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

module.exports.deleteFoodPlacePhoto = (req,res) =>{ // one photo at a time
	//input
	const foodPlaceID = Number (req.params.foodPlaceID)
	const foodPlacePhoto = req.body.foodPlacePhoto

	//create query
	const deletePictureQuery = `DELETE FROM FOOD_PLACE_PICTURES WHERE (Food_place_id=${foodPlaceID} AND Picture="${foodPlacePhoto}")`
	//execute query
	database.query(deletePictureQuery, (err, result)=>{
		if(err){
			console.log("DELETE PHOTO FROM DB ERR: ", err)
			throw new Error("DELETE PHOTO FROM DB ERR: ", err)
		}else{
			console.log("SUCCESSFUL DELETION: ", req.params.foodPlaceID, " + ", req.body)
			res.status(200).json({msg: "Successfully removed photo from database!"})
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

// *************************************************** CHECK IF IN DB ***************************************************

module.exports.checkUsername = (req, res) => { // invoke this function when a user is inputing username when creating an account
	// get username from request
	const username = req.body.username

	//create query 
	const checkUsernameQuery = `SELECT Username from USER WHERE Username = '${username}'`
	//execute query
	database.query(checkUsernameQuery, async (err, result)=>{
		if(err){
			console.log("CHECK USERNAME IN DB ERR: ", err)
		}else{
			if(result.length === 0){
				console.log("I AM HERE BRUH IN TRUE")
				// res.status(200).json({"infoValid": true, "msg":"Username is available!"})
				let returnMe = {
					infoValid : true
				}
				res.status(200).send(returnMe)
			}else{
				console.log("I AM HERE BRUH IN FALSE")
				let returnMe = {
					infoValid : false
				}		
				res.status(200).send(returnMe)
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

module.exports.checkPassword = (req, res) => {
	const password = req.body.password
	const id = Number (req.body.userID)

	//create query
	const getUserQuery = `SELECT * FROM USER WHERE User_id = ${id}`
	database.query(getUserQuery, async (err,result)=>{
		if(err){
			console.log(err)
			throw new Error("GET USER FROM DB IN CHECK PW ERR: ", err)
		}else{
			if(result.length===0){ // user does not exist
				res.status(200).json({msg: "User not found"})
			}else{
				let comparePWToHash = await bcrypt.compare(password, result[0].Password)
				if(comparePWToHash){
					res.status(200).json({msg: true}) // password is same
				}else{
					res.status(200).json({msg:false}) // password is wrong
				}
			}
		}
	})
}

module.exports.loginUser = (req,res) =>{ // login user to website
	//user input 
	const checkName = req.body.username
	const password = req.body.password
	if(checkName && password){ // check if username and password exists
		const getUserQuery = `SELECT * FROM USER WHERE Username="${checkName}"`
		database.query(getUserQuery, async(error, results)=>{
				console.log("RESULTS: ", results)
			if(results.length !== 0){
				let comparePWToHash = await bcrypt.compare(password, results[0].Password)
				if(comparePWToHash){
					//logged in
					const token = jwt.sign({
						id : results[0].User_id
					}, process.env.TOKEN_SECRET, {expiresIn: process.env.TOKEN_EXPIRY})
					return res.status(200).json({ authorized: true, msg: "Successfully logged in!", token})
				}else{
					//incorrect password
					return res.status(200).json({ authorized: false, msg: "Please check the Username and/or Password"})
				}
			}else{
				//no such user
				return res.send({authorized: false, msg:"Please check the Username and/or Password"})
				// console.log("Not in the database")
			}
		})
	}else{
		//no inputs
		console.log("Caught no username or password")
		return res.send("Please enter the username and password in the fields")
	}
}


// *************************************************** UPDATE IN DB ***************************************************

module.exports.updateAccountInfo = async (req,res) =>{
	//input 
	const userID = Number (req.body.userID)
	const username = req.body.origUsername
	const updateInfo = {		//Send current/old values if no changes
		name 		: req.body.newName,
		username 	: req.body.newUsername,
		email 		: req.body.newEmail, 
		password 	: req.body.newPassword,
		picture 	: req.body.newPicturePath,
		accType 	: req.body.accType // strictly should only be "Business_owner" or "Customer", case sensitive
	}

	console.log("CONTENTS OF THE BODY: ", req.body)
	//check in database if username is unique
	database.query(`SELECT * FROM USER WHERE Username = "${updateInfo.username}"`, (error, results)=>{
		console.log("UPDATE PROFILE GET USER FR USERNAME RESULTS: ", results)
		if(results.length!==0 && results[0].User_id!==userID){ // if query returns a result that is not the same with userID, username is not unique
			console.log("Username not unique")
			return res.status(200).json({msg: "Please use another Username"})
		}else{
			// console.log("Username is unique")
			database.query(`SELECT * FROM USER WHERE Email = "${updateInfo.email}"`, async (error, results)=>{
				if(results.length!==0  && results[0].User_id!==userID){ // same idea with the username
					//return
					console.log("Email not unique")
					return res.status(200).json({msg: "Please use another email "})
				}else{
					//username and email is unique
					let userPW = await bcrypt.hash(updateInfo.password, 8) // re-hash password whether it's the old one or a new one
					const updateUserWPWQuery = updateInfo.picture === "null" ? `UPDATE USER SET Name="${updateInfo.name}", Username = "${updateInfo.username}", Email = "${updateInfo.email}", Password="${userPW}", User_type = "${updateInfo.accType}"  WHERE User_id = ${userID}` : `UPDATE USER SET Name="${updateInfo.name}", Username = "${updateInfo.username}", Email = "${updateInfo.email}", Password="${userPW}", Picture = "${updateInfo.picture}", User_type = "${updateInfo.accType}"  WHERE User_id = ${userID}`
					// console.log(updateUserWPWQuery)
					database.query(updateUserWPWQuery, (err, result)=>{
						if(err) {
							console.log("UPDATE USER WITH PW ERROR IN DB: ", err)
							throw new Error("UPDATE USER PROFILE ERR IN DB: ", err)
						}else{
							// console.log("successfully updated profile!")
							return res.status(200).json({msg: "Successfully updated profile!"})
						} 
					})
				}
			})
		}
	})
}

module.exports.updateFoodPlace = async (req,res) =>{ // this should only be invoked by the business owner
	//input 
	const foodPlaceID = Number (req.body.foodPlaceID)
	const updateInfo = {		//Send current/old values if no changes
		foodPlaceName : req.body.newName,
		location : req.body.newLocation,
		priceRange : req.body.newPrice, 
		description : req.body.newDesc,
		openTime : req.body.newOpen, // NULL if 24 hr open; 100-2400
		closeTime : req.body.newClose, // NULL; 100-2400
		daysOpen : req.body.newDays, // 0123456
		foodTypes : req.body.newFoodTypes, // Meat, Vegetable, Seafood, Ice Cream, Snacks
		longitude : req.body.newLongitude,
		latitude : req.body.newLatitude
	}

	//construct query
	const editFoodPlaceQuery = `UPDATE FOOD_PLACE SET Food_place_name="${updateInfo.foodPlaceName}", Location="${updateInfo.location}", Price_range="${updateInfo.priceRange}", Description="${updateInfo.description}", Opening_time="${updateInfo.openTime}", Closing_time="${updateInfo.closeTime}", Days_open="${updateInfo.daysOpen}", Food_types="${updateInfo.foodTypes}", Longitude=${updateInfo.longitude}, Latitude=${updateInfo.latitude} WHERE Food_place_id=${foodPlaceID}`

	const editFoodPlace24H = `UPDATE FOOD_PLACE SET Food_place_name="${updateInfo.foodPlaceName}", Location="${updateInfo.location}", Price_range="${updateInfo.priceRange}", Description="${updateInfo.description}", Opening_time=NULL, Closing_time=NULL, Days_open="${updateInfo.daysOpen}", Food_types="${updateInfo.foodTypes}", Longitude=${updateInfo.longitude}, Latitude=${updateInfo.latitude} WHERE Food_place_id=${foodPlaceID}`

	if(updateInfo.openTime === null || updateInfo.closeTime === null || updateInfo.closeTime === "null" || updateInfo.openTime === "null"){
		console.log("here! : ", typeof updateInfo.openTime, typeof updateInfo.closeTime, typeof null)
		database.query(editFoodPlace24H, (err,result)=>{
			if(err){
				console.log("EDIT FOOD PLACE ERR 24H IN DB: ", err)
			}else{
				console.log("Updated food place! ")
				res.status(200).json({msg: "Successfully updated food place!"})
			}
		})
	}else{
		database.query(editFoodPlaceQuery, (err,result)=>{
			if(err){
				console.log("EDIT FOOD PLACE ERR IN DB: ", err)
			}else{
				console.log("Updated food place! ")
				res.status(200).json({msg: "Successfully updated food place!"})
			}
		})
	}
}

// *************************************************** MISCELLANEOUS ***************************************************

module.exports.showAllUsers = (req, res) => { // dummy function, not useful for actual app
	//create query
	const getAllUsersQuery = `SELECT * FROM USER`
	//execute query
	database.query(getAllUsersQuery, async(err, result) => {
		if(err){
			console.log("DATABASE GET ALL USERS QUERY ERR: ", err)
		}else{
			// console.log(result)
			res.status(200).json(result)
		}
	})
}

module.exports.verifyToken = (req, res) => { // verify token using jwt; does not do anything to the db
	const token = req.body.token

	try{
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
		// console.log(decoded)
		const User_id = decoded.id
		res.status(200).json({msg:"Successfully verified token!", User_id})
	}catch(error){
		res.status(401)
		throw new Error(error)
	}
}



