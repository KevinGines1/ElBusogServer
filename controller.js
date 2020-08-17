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
			// console.log(result)
			// return res.status(200).json(result)
			res.status(200).json(result)
		}
	})
}

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
	const addFoodPlaceQuery = `INSERT INTO FOOD_PLACE(Food_place_name, Location, Price_range, Description, Opening_time, Closing_time, Days_open, Food_types, User_id) VALUES ("${foodPlaceInfo.name}", "${foodPlaceInfo.location}","${foodPlaceInfo.priceRange}", "${foodPlaceInfo.description}", "${foodPlaceInfo.openTime}", "${foodPlaceInfo.closeTime}", "${foodPlaceInfo.daysOpen}", "${foodPlaceInfo.foodTypes}", (SELECT User_id from USER where Username="${foodPlaceInfo.owner}"))`

	//execute query
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
		foodPlaceId : req.body.foodPlaceID,
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
			// console.log(result)
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
				console.log("I AM HERE BRUH IN TRUE")
				// res.status(200).json({"infoValid": true, "msg":"Username is available!"})
				let returnMe = {
					infoValid : true,
					msg: "Username is available!"
				}
				res.status(200).send(returnMe)
			}else{
				console.log("I AM HERE BRUH IN FALSE")
				let returnMe = {
					infoValid : false,
					msg: "Username is already taken!"
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
	if(userInfo.picture === "NULL" || userInfo.picture === null){
		const addUserToDBQuery = `INSERT INTO USER(Name, Username, Email, Password,  User_type) VALUES ("${userInfo.name}","${userInfo.username}", "${userInfo.email}", "${userPW}", "${userInfo.type}")`
		database.query(addUserToDBQuery, (err, result)=>{
			if(err){
				console.log("ADD USER TO DB ERR: ", err)
				throw new Error("AARON ERR ", err)
			}else{
				res.status(200).json({msg:"Successfully added user!"})
			}
		})
	}else{
		const addUserToDBQuery = `INSERT INTO USER(Name, Username, Email, Password, Picture,  User_type) VALUES ("${userInfo.name}","${userInfo.username}", "${userInfo.email}", "${userPW}", "${userInfo.picture}", "${userInfo.type}")`
		database.query(addUserToDBQuery, (err, result)=>{
			if(err){
				console.log("ADD USER TO DB ERR: ", err)
				throw new Error("AARON ERR 2", err)
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
	const userID = Number (req.body.userID)
	const username = req.body.origUsername
	const updateInfo = {		//Send current/old values if no changes
		name : req.body.newName,
		username : req.body.newUsername,
		email : req.body.newEmail, 
		password : req.body.newPassword,
		picture : req.body.newPicturePath === "null" ? null : req.body.newPicturePath,
		accType : req.body.accType === "Business_owner" ? "Business_owner" : "Customer"
	}

	//check in database if username is unique
	database.query('SELECT * FROM USER WHERE Username = ?', [updateInfo.username], function(error, results, fields){
		if(results.length!==0 && results[0].User_id!==userID){
			//return
			console.log("Username not unique")
			return res.json({msg: "Please use another Username"})
		}else{
			// console.log("Username is unique")
			database.query('SELECT * FROM USER WHERE Email = ?', [updateInfo.email], async function(error, results, fields){
				if(results.length!==0  && results[0].User_id!==userID){
					//return
					console.log("Email not unique")
					return res.json({msg: "Please use another email "})
					// return 						//early return
				}else{
					//username and email is unique
					// check the password first if its new 
					database.query(`SELECT Password from USER WHERE User_id=${userID}`, async (err, results)=>{
						let comparePWToHash = await bcrypt.compare(updateInfo.password, results[0].Password)
						// console.log(comparePWToHash)
						if(comparePWToHash){ // password unchanged
							// console.log("updated but not the password")

							const updateUserNoPWQuery = updateInfo.picture === null ? `UPDATE USER SET Name="${updateInfo.name}", Username = "${updateInfo.username}", Email = "${updateInfo.email}", User_type = "${updateInfo.accType}"  WHERE User_id = ${userID}` : `UPDATE USER SET Name="${updateInfo.name}", Username = "${updateInfo.username}", Email = "${updateInfo.email}", Picture = "${updateInfo.picture}", User_type = "${updateInfo.accType}"  WHERE User_id = ${userID}`
							database.query(updateUserNoPWQuery, (err, result)=>{
								if(err){
									console.log("UPDATE USER W/O PW ERROR IN DB: ", err)
									throw new Error("ZEIT ERROR: ", err)
								}else{
									console.log("successfully updated profile without password ")
									return res.status(200).json({msg: "Successfully updated profile!"})
								} 
							})						
						}else{ // new password
							//encrypt new password
							let userPW = await bcrypt.hash(updateInfo.password, 8)
							// console.log("new PW: ", userPW)
							const updateUserWPWQuery = updateInfo.picture === null ? `UPDATE USER SET Name="${updateInfo.name}", Username = "${updateInfo.username}", Email = "${updateInfo.email}", Password="${userPW}", User_type = "${updateInfo.accType}"  WHERE User_id = ${userID}` : `UPDATE USER SET Name="${updateInfo.name}", Username = "${updateInfo.username}", Email = "${updateInfo.email}", Password="${userPW}", Picture = "${updateInfo.picture}", User_type = "${updateInfo.accType}"  WHERE User_id = ${userID}`
							database.query(updateUserWPWQuery, (err, result)=>{
								if(err) {
									console.log("UPDATE USER WITH PW ERROR IN DB: ", err)
									throw new Error("ZEIT ERROR2: ", err)
								}else{
									console.log("successfully updated profile ")
									return res.status(200).json({msg: "Successfully updated profile!"})
								} 
							})	
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
		// longitude : req.body.longitude,
		// latitude : req.body.latitude
	}

	//construct query
	const editFoodPlaceQuery = `UPDATE FOOD_PLACE SET Food_place_name="${updateInfo.foodPlaceName}", Location="${updateInfo.location}", Price_range="${updateInfo.priceRange}", Description="${updateInfo.description}", Opening_time="${updateInfo.openTime}", Closing_time="${updateInfo.closeTime}", Days_open="${updateInfo.daysOpen}", Food_types="${updateInfo.foodTypes}" WHERE Food_place_id=${foodPlaceID}`


	database.query(editFoodPlaceQuery, (err,result)=>{
		if(err){
			console.log("EDIT FOOD PLACE ERR IN DB: ", err)
		}else{
			console.log("Updated food place! ")
			res.status(200).json({msg: "Successfully updated food place!"})
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
			console.log(result)
			res.status(200).json(result)
		}
	})
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

module.exports.showAllUsers = (req, res) => { // dummy function, not useful for actual app
	//create query
	const getAllUsersQuery = `SELECT * FROM USER`
	//execute query
	database.query(getAllUsersQuery, async(err, result) => {
		if(err){
			console.log("DATABASE GET ALL USERS QUERY ERR: ", err)
		}else{
			// console.log(result)
			// return res.status(200).json(result)
			res.status(200).json(result)
		}
	})
}

module.exports.getJeepneyStop = (req, res) => {

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

	//Haversine stuff
	radians = (degrees) => {
    	return(degrees * Math.PI / 180);
	}

	const r = 6373.0                    //this is the radius of the Earth and will be used for distance calculation
	var jeepneyStopName = null          //the name of the closest jeepney stop
	var jeepneyStopDistance = null      //the distance of the closest jeepney stop

	//inputs
	const foodPlaceID = req.params.foodPlaceID
	const userLat = req.params.latitude
	const userLng = req.params.longitude

	var foodPlaceLngRad = null
	var foodPlaceLatRad = null
	var foodPlaceLat1 = null
	var foodPlaceLng1 = null

	//query here
	const getFoodPlaceQuery = `SELECT * FROM FOOD_PLACE WHERE Food_place_id = ${foodPlaceID}`
	//execute query
	database.query(getFoodPlaceQuery, (err,result)=>{
		if(err){
			console.log(err)			//ID might be wrong
		}else{
			foodPlaceLng = Number(result[0].Longitude)
			foodPlaceLat = Number(result[0].Latitude)

			foodPlaceLat1 = foodPlaceLat
			foodPlaceLng1 = foodPlaceLng

			foodPlaceLngRad = radians(foodPlaceLng)
			foodPlaceLatRad = radians(foodPlaceLat)
		}
	})
	jeepneyStops.forEach((stop)=>{
		lngRad = radians(stop.stop_lng)
		latRad = radians(stop.stop_lat)
	

		diffLng = lngRad - foodPlaceLngRad
		diffLat = latRad - foodPlaceLatRad

		a = Math.sin(diffLat / 2)**2 + Math.cos(foodPlaceLatRad) * Math.cos(latRad) * Math.sin(diffLng / 2)**2;
		c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 -a));
	    distance = r * c * 1000;        //distance in meters

	    // compare the distance with the closest recorded distance
	    if(jeepneyStopDistance === null || jeepneyStopDistance > distance) {
	        jeepneyStopName = stop.stop_name
	        jeepneyStopDistance = distance;
	    }
	})

	// console.log("Distance " + jeepneyStopDistance + " At " + jeepneyStopName)

	// const returnMsg = `Take the ${routeName} jeep and stop at ${jeepneyStopName}. It has a distance of ${jeepneyStopDistance} from the food place.`
	
	// res.status(200).json({
	// 	"msg": returnMsg
	// })

	//RideStart Check
	userLngRad = radians(userLng)				//depends if it needs to be changed to int; Number(x)
	userLatRad = radians(userLat)

	var jeepneyStartName = null       
	var jeepneyStartDistance = null      

	jeepneyStops.forEach((stop)=>{
		lngRad = radians(stop.stop_lng)
		latRad = radians(stop.stop_lat)
	

		diffLng = lngRad - userLngRad
		diffLat = latRad - userLatRad

		a = Math.sin(diffLat / 2)**2 + Math.cos(userLatRad) * Math.cos(latRad) * Math.sin(diffLng / 2)**2;
		c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 -a));
	    distance = r * c * 1000;        //distance in meters

	    // compare the distance with the closest recorded distance
	    if(jeepneyStartDistance === null || jeepneyStartDistance > distance) {
	        jeepneyStartName = stop.stop_name
	        jeepneyStartDistance = distance;
	    }
	})
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

	Bx = foodPlaceLat1
	By = foodPlaceLng1

	Cx = userLat
	Cy = userLng

	route = direction(Ax,Ay,Bx,By,Cx,Cy)

	routeObject = {
		'route' : route,
		'rideStart' : jeepneyStartName,
		'rideStop' 	: jeepneyStopName
	}

	res.status(200).json(routeObject)

}

