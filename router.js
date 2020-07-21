const controller = require('./controller')

module.exports = (app) => {
	app.get('/api/getAllFoodPlaces', controller.getAllFoodPlaces)
	app.get('/api', controller.home)
	app.get('/api/getAllUsers', controller.showAllUsers)
}