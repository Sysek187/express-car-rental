// cookie parser
const cookieParser = require('cookie-parser');
const path = require('path')
const fileupload = require("express-fileupload");

// controller
const carRentalController = require('../controllers/carRentalController');

// auth route
const authRoutes = require('./auth')

// auth middleware

const {
    requireAuth,
    checkIfAuth
} = require('../middleware/authMiddleware');

// admin middleware
// const {
//     uploadFile
// } = require('../middleware/adminMiddleware');

// database
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const adminController = require('../controllers/adminController');

const url = process.env.dbURI;


const client = new MongoClient(url, { // connect to mongodb
    useNewUrlParser: true,
    useUnifiedTopology: true
});

client.connect(err => {
    const user = client.db("rental").collection("user");
    // perform actions on the collection object

    user.insertOne({
        name: "Dominik" ,
        surname: "Sysasdsadasdkaaaaa"
    })
    // client.close();
  });

// port
const port = 3000;

function wrapper(app) {

    // listening on port 3000
    app.listen(port, () => {
        console.log(`Server running at: http://127.0.0.1:${port}`);
    });

    // template engine
    app.set('template engine', 'ejs');

    // middleware for static files
    app.use('/static', express.static('public'));

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
    // cookie middleware
    app.use(cookieParser());
    app.use(fileupload());

    // routing
    app.get('/', carRentalController.carRentalHome);
    app.get('/offer', checkIfAuth, carRentalController.carRentalOffer);
    app.get('/contact', checkIfAuth, carRentalController.carRentalContact);
    app.get('/panel', requireAuth, adminController.adminPanelHome);
    app.get('/locations', requireAuth, adminController.adminPanelLocationsGet);
    app.post('/addlocation', requireAuth, adminController.adminPanelLocationsPost);
    app.get('/addcar', requireAuth, adminController.adminPanelCars);
    app.post('/addcar', requireAuth, adminController.adminPanelAddCar);
    app.get('/removeloc', requireAuth, adminController.adminPanelLocationsRemove);
    app.post('/rent', requireAuth, carRentalController.carRentalRent, carRentalController.carRentalRented);
    //app.get('/rented', requireAuth,);
    //app.get('/notrented', requireAuth, carRentalController.carRentalNotRented);
    app.use(authRoutes); // auth routing

    app.use(carRentalController.carRental404) // 404 not found

}
module.exports = wrapper;