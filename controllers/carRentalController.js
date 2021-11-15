const mongo = require('mongodb');
const express = require('express');

const client = new mongo.MongoClient('mongodb://localhost:27017', { // connect to mongodb
    useNewUrlParser: true
});
const path = require('path');
const { authToken: authorization } = require('./authController');
const { get } = require('http');
const { checkIfAuth } = require('../middleware/authMiddleware');
const { ObjectID } = require('bson');
// const {
//     start
// } = require('repl'); 
const db = client.db('rental');

const checkIfLogged = async (req, res) => {
    let userData = null;
    let userid = req.userId && req.userId.id;
    if (userid) {
        const userCol = db.collection('user');
        userData = await userCol.findOne({ "_id": mongoose.Types.ObjectId(userid) });
    }
    return { userData, userid };
}

const carRentalHome = (req, res) => {

    client.connect(async (err) => { // connect to mongodb
        if (err) {
            console.log(err); // if error, print it
        } else {
            console.log('Connected to the database'); // connected to the 
            const rentOffer = db.collection('offer'); // 
            let { userData, userid } = await checkIfLogged(req, res);

            res.render(path.join(__dirname, '../public/views', 'index.ejs'), {
                user: userData,
                admin: req.admin
            });
        }

    });
}

const carRentalOffer = async (req, res) => {

    client.connect(async (err) => { // connect to mongodb
        if (err) {
            console.log(err); // if error, print it
        } else {
            console.log('Connected to the database'); // connected to the database

            const offer = db.collection('car'); // collection
            const rents = db.collection('rents');
            const locations = db.collection('location');

            let { userData, userid } = await checkIfLogged(req, res);

            let perPage = 6;
            let page = req.query.page || 1;
            let count = await offer.count();

            offer.find({}).skip((perPage * (page - 1))).limit(perPage).toArray(async (err, items) => {
                if (err) {
                    console.log(err);
                } else {
                    items = await Promise.all(items.map(async (x) => {
                        x['id'] = x['_id'].toString();
                        let rented = await rents.findOne({ 'carid': x['id'] });
                        x['avalible'] = (rented == null);
                        return x;
                    }));

                    let locs = await locations.find({}).toArray();
                    await Promise.all(locs.map(async (x) => {
                        x['id'] = x['_id'].toString();
                        return x;
                    }));
                    //console.log(items);
                    //console.log(locs);
                    res.render(path.join(__dirname, '../public/views', 'offer.ejs'), {
                        data: items,
                        user: userData,
                        locs: locs,
                        admin: req.admin,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });

        }
    });
}

const carRentalRent = (req, res, next) => {

    let {
        carid,
        start_location,
        end_location,
        start_date,
        end_date,
        phone
    } = req.body;

    carid = carid.substring(0, carid.length - 1);

    client.connect(async (err) => { // connect to mongodb
        if (err) {
            console.log(err); // if error, print it
        } else {
            console.log('Connected to the database'); // connected to the database

            const cars = db.collection('car'); // collection
            const rents = db.collection('rents');
            const locations = db.collection('location');

            let { userData, userid } = await checkIfLogged(req, res);
            
            if (start_date >= end_date) {
                console.log('wrong dates');
                req.error = true;
                next()
                return;
            }
            const car = await cars.findOne({ "_id": mongoose.Types.ObjectId(carid) });
            if (!car) {
                console.log('wrong car');
                req.error = true;
                next()
                return;
            }
            const startl = await locations.findOne({ "_id": mongoose.Types.ObjectId(start_location) });
            if (!startl) {
                console.log('wrong start l');
                req.error = true;
                next()
                return;
            }
            const endl = await locations.findOne({ "_id": mongoose.Types.ObjectId(end_location) });
            if (!endl) {
                console.log('wrong end l');
                req.error = true;
                next()
                return;
            }

            rents.insertOne({
                'carid': carid,
                'userid': userid,
                'start_location': start_location,
                'end_location': end_location,
                'start_date': start_date,
                'end_date': end_date,
                'phone': phone
            });

            req.error = false;
            next()
        }
    });
}

const carRentalRented = async (req, res) => {

    let { userData, userid } = await checkIfLogged(req, res);
    res.render(path.join(__dirname, '../public/views', 'rented.ejs'), {
        status: req.error,
        user: userData,
        admin: req.admin
    });
}

const carRentalContact = async (req, res) => {
    let { userData, userid } = await checkIfLogged(req, res);

    res.render(path.join(__dirname, '../public/views', 'contact.ejs'), {
        user: userData,
        admin: req.admin
    });
}

const carRental404 = (req, res) => {
    res.status(404).render(path.join(__dirname, '../public/views', '404.ejs'));
}

module.exports = {
    carRentalHome: carRentalHome,
    carRentalOffer: carRentalOffer,
    carRentalContact: carRentalContact,
    carRental404: carRental404,
    carRentalRent: carRentalRent,
    carRentalRented: carRentalRented
}