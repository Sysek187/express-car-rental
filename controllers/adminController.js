const mongo = require('mongodb');
const mongoose = require('mongoose')
const express = require('express');

const client = new mongo.MongoClient('mongodb://localhost:27017', { // connect to mongodb
    useNewUrlParser: true
});
const path = require('path');
const { authToken: authorization } = require('./authController');
const { get } = require('http');
const { createVerify } = require('crypto');

const adminPanelHome = (req, res) => {

    client.connect(async (err) => {
        if (err) {
            console.log(err)
        } else {
            // if(!req.admin) {
            //     res.redirect('/');
            //     return;
            // }        
            res.render(path.join(__dirname, '../public/views', 'panel.ejs'), {

            });
        }

    });

}
const adminPanelCars = (req, res) => {

    client.connect(async (err) => {
        if (err) {
            console.log(err)
        } else {
            // if(!req.admin) {
            //     res.redirect('/');
            //     return;
            // }

            res.render(path.join(__dirname, '../public/views', 'addcar.ejs'), {
            });

        }

    });
}

const adminPanelAddCar = async (req, res) => {
    let {
        model,
        brand,
        year,
        reg_city,
        reg,
        price,
        image
    } = req.body;

    client.connect(async (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Connected to the database");

            const db = client.db('rental');
            const carsCol = db.collection('car');

            try {

                const car = await carsCol.insertOne({
                    'model': model,
                    'brand': brand,
                    'year': year,
                    'reg_city': reg_city,
                    'reg': reg,
                    'price': price
                });
               // console.log(car);

                let sampleFile;
                let uploadPath;
                if (!req.files || Object.keys(req.files).length === 0) {
                    return res.status(400).send('No files were uploaded.');
                }

                // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
                sampleFile = req.files.image;
                uploadPath = path.join(__dirname, '../public/cars/' + car['insertedId'].toString() + path.extname(sampleFile.name));
                // Use the mv() method to place the file somewhere on your server
                sampleFile.mv(uploadPath, function (err) {
                    if (err){
                        console.log(err);
                        return res.status(500).send(err);
                    }
                });

                res.redirect('/');
            } catch (err) {
                console.log(err);
            }
        }
    });
}

const adminPanelLocationsGet = (req, res) => {
    
    client.connect((err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Connected to the database");

            const db = client.db('rental');
            const locations = db.collection('location');

            locations.find({}).toArray((err, items) => {
                if(err){
                    console.log(err);
                }else{
                    res.render(path.join(__dirname,'../public/views/locations.ejs'),{
                        data: items
                    });
                }
            });

        }
    });
}

const adminPanelLocationsPost = async (req, res) => {
    
    let {
        city,
        address
    } = req.body;

    client.connect(async (err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Connected to the database");

            const db = client.db('rental');
            const locations = db.collection('location');

            const newloc = await locations.insertOne({
                'city' : city,
                'address' : address
            })
            if(newloc){
                res.redirect('/locations');
            }else{
                res.json({'error':'can not add'}).redirect('/locations');
            }

        }
    });
}

const adminPanelLocationsRemove = (req, res) => {
    client.connect(async (err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Connected to the database");

            let toremove = req.query.id || -1

            if(toremove == -1) {
                res.redirect('/locations');
            }

            const db = client.db('rental');
            const locations = db.collection('location');

            locations.find({}).toArray(async (err, items) => {
                if(err){
                    console.log(err);
                }else{
                    let item = items[toremove];
                    if(item){
                        let id = item['_id'];
                        await locations.deleteOne({'_id':id});
                        res.redirect('/locations');
                    }
                }
            });

        }
    })
}

module.exports = {
    adminPanelHome: adminPanelHome,
    adminPanelCars: adminPanelCars,
    adminPanelAddCar: adminPanelAddCar,
    adminPanelLocationsGet: adminPanelLocationsGet,
    adminPanelLocationsPost: adminPanelLocationsPost,
    adminPanelLocationsRemove: adminPanelLocationsRemove
}