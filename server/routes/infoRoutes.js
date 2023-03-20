const router = require('express').Router();
const User = require('../models/users');
const {trainSchedules,nearbyAccessories,nearbyHotels,transitPoints,getFlights,getDestCityData}=require('../controllers/appController')
const bcrypt = require('bcrypt')


router.get('/getTrainSchedules/:srcCity/:destCity', trainSchedules);
router.get('/getNearbyAccesories/:cityName',nearbyAccessories);
router.get('/getNearbyHotels/:cityname',nearbyHotels);
router.get('/getcities/:city/:dest_city',transitPoints);
router.get('/getFlights/:src_city/:dest_city/:date',getFlights);
router.get('/getDestinationCityData/:destCity',getDestCityData)


module.exports = router
