const User = require("../models/user.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");

module.exports.setup = passport => {
  passport.serializeUser((user, next) => {
    next(null, user._id);
  });

  passport.deserializeUser((id, next) => {
    User.findById(id)
      .then(user => {
        next(null, user);
      })
      .catch(error => next(error));
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID || keys.googleClientID,
        clientSecret:
          process.env.GOOGLE_AUTH_CLIENT_SECRET || keys.googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || keys.googleCallbackUrl,
        proxy: true
      },
      authenticateOAuthUser
    )
  );

  function authenticateOAuthUser(accessToken, refreshToken, profile, next) {
    let socialId = `${profile.provider}Id`;
    User.findOne({ [`social.${socialId}`]: profile.id })
      .then(user => {
        if (user) {
          next(null, user);
        } else {
          user = new User({
            name: profile.displayName.split(" ")[0],
            email: profile.emails[0].value,
            password: Math.random()
              .toString(36)
              .substring(7),
            social: {
              [socialId]: profile.id
            }
          });
          return user.save().then(user => {
            next(null, user);
          });
        }
      })
      .catch(error => next(error));
  }
};
