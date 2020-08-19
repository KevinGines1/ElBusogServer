const controller = require('./controller')

module.exports = (app) => {
	app.get('/',											    controller.docs) //
	app.get('/api/getAllFoodPlaces', 							controller.getAllFoodPlaces)//
	app.get('/api/getAllUsers', 								controller.showAllUsers) 
	app.get('/api/getOwnFoodPlace/:userID', 					controller.getOwnFoodPlace) //
	app.get('/api/comments/:foodPlaceId', 						controller.getComments) //
	app.get('/api/profile/:username', 							controller.getProfile) //
	app.get('/api/photos/:foodPlaceID',					     	controller.getFoodPlacePhotos) //
	app.get('/api/locate/:latitude&:longitude&:foodPlaceID', 	controller.getJeepneyStop) //
	app.post('/api/addFoodPlace', 								controller.addFoodPlace) //
	app.post('/api/checkUsername', 								controller.checkUsername) //
	app.post('/api/checkEmail', 								controller.checkEmail) //
	app.post('/api/checkPassword',								controller.checkPassword)
	app.post('/api/register', 									controller.createAccount) //
	app.post('/api/login', 								        controller.loginUser) //
	app.post('/api/addComment', 								controller.addComment) //
	app.post('/api/addPhoto',				   				    controller.addFoodPlacePhoto) //
	app.post('/api/remove/photo/:foodPlaceID',				    controller.deleteFoodPlacePhoto) //
	app.post('/api/verifyToken',								controller.verifyToken) //
	app.delete('/api/removeFoodPlace/:foodPlaceId', 			controller.deleteFoodPlace) //
	app.delete('/api/remove/customer/:username', 				controller.deleteAccountCustomer) //
	app.delete('/api/remove/owner/:username',     				controller.deleteBusinessOwner) //
	app.delete('/api/remove/comment',     			        	controller.deleteComments) //
	app.patch('/api/profile/update',     			        	controller.updateAccountInfo) // 
	app.patch('/api/editFoodPlace',     			        	controller.updateFoodPlace) //
}