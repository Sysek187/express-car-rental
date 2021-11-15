const {
    Router
} = require('express');

const router = Router();

// auth controller
const authController = require('../controllers/authController');


// sign up endpoint
router.route('/login')
    .get(authController.login_get)
    .post(authController.login_post)


// log in endpoint
router.route('/signup')
    .get(authController.signup_get)
    .post(authController.signup_post)

router.get('/logout', authController.logout_get);


module.exports = router;