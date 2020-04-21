var Dropbox = require('dropbox').Dropbox;
require('isomorphic-fetch');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
var dbx = new Dropbox({ fetch:fetch, accessToken: process.env.ACCESS_TOKEN });
const User = require('../models/user.model');
const Book = require('../models/book.model');



exports.uploadDB = function (filePath,updatedProfile) {
  console.log(updatedProfile);
  path = "./public/uploads/" + filePath;
  fs.readFile(path, function (err, contents) {
      if (err) {
        console.log('Error: ', err);
      } 
      // This uploads basic.js to the root of your dropbox
      dbx.filesUpload({ path: '/' + filePath, contents: contents })
        .then(function (response) {
          parameters = {
                  "path": response.path_lower,
                  "settings": {
                      "requested_visibility": "public"
              }
          };
          fs.unlink(path);
          dbx.sharingCreateSharedLinkWithSettings(parameters)
          .then(response => {
              urlAux = response.url.split("/s");
              url = urlAux[1].split("?");
              console.log(url);
              if (updatedProfile.username) {
              User.findByIdAndUpdate(updatedProfile, { profileImg: url[0] }, { new: true })
                .then((user) => console.log(user));
              } else {
              Book.findByIdAndUpdate(updatedProfile, { imgs: url[0] }, { new: true })
                .then((book) => console.log(user));
            }
             // return response.url;
          })
          .catch(function (err) {
              console.log(err);
            });
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  }