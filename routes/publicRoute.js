const express = require('express')
const public_route = express()
const publicController = require("../controllers/publicController")


public_route.set('view engine', 'ejs')
public_route.set('views', './views/public')


public_route.get("/", publicController.loadHome)



module.exports = public_route
