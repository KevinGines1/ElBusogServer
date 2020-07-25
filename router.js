const controller = require('./controller')

module.exports = (app) => {
	app.get('/',											    controller.docs)
	app.get('/api/getAllFoodPlaces', 							controller.getAllFoodPlaces)
	app.get('/api/getAllUsers', 								controller.showAllUsers)
	app.get('/api/getFoodPlace/priceRange/:priceRange', 		controller.getFoodPlaceWithinRange)
	app.get('/api/getFoodPlace/foodType/:foodType', 			controller.getFoodPlaceWithFoodType)
	app.post('/api/addFoodPlace', 								controller.addFoodPlace)
	app.delete('/api/removeFoodPlace/:foodPlaceId', 			controller.deleteFoodPlace)
	app.post('/api/addComment', 								controller.addComment)
	app.get('/api/comments/:foodPlaceId', 						controller.getComments)
	app.post('/api/checkUsername', 								controller.checkUsername)
	app.post('/api/checkEmail', 								controller.checkEmail)
	app.post('/api/register', 									controller.createAccount)
	app.delete('/api/remove/customer/:username', 				controller.deleteAccountCustomer)
	app.get('/api/profile/:username', 							controller.getProfile)
}