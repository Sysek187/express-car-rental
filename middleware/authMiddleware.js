const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config()

// check if jwt exists 
const requireAuth = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'secret token', (err, decodedToken) => {
            if (err) {
                console.log('Token is invalid')
                res.redirect('/login')
            } else {
                //console.log(decodedToken)
                req.userId = decodedToken;
                req.admin = req.userId['id'] == process.env.ADMIN_ID
                next();
            }
        })
    } else {
        res.redirect('/login')
    }
}

const checkIfAuth = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'secret token', (err, decodedToken) => {
            if (err) {
                console.log('Token is invalid')
                next();
            } else {
                //console.log(decodedToken)
                req.userId = decodedToken;
                req.admin = req.userId['id'] == process.env.ADMIN_ID
                next();
            }
        })
    } else {
        next();
    }
}

module.exports = {
    requireAuth,
    checkIfAuth
};