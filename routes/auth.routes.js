const express = require('express');
const passport = require("passport");


const { signup, signin, signout, forgotPassword, resetPassword, socialLogin, loginWithGoogle } = require('../controllers/auth.controller');

// import password reset validator
const { userSignupValidator, userSigninValidator, passwordResetValidator } = require('../validator');
const { userById } = require('../controllers/user.controller');

const router = express.Router();

router.post('/signup', userSignupValidator, signup);
router.post('/signin', userSigninValidator, signin);
router.get('/signout', signout);

// password forgot and reset routes
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', passwordResetValidator, resetPassword);

// then use this route for social login
router.post('/social-login', socialLogin);
router.get("/auth/google/callback", loginWithGoogle);
router.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["openid", "profile", "email"]
    })
  );

// any route containing :userId, our app will first execute userByID()
router.param('userId', userById);

module.exports = router;