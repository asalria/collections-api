const Collection = require('../models/collection.model');
const formidable = require('formidable');
var cloud = require('../config/cloudinary.config');
const fs = require('fs');
const _ = require('lodash');


exports.collectionById = (req, res, next, id) => {
    Collection.findById(id)
        .populate('createdBy', '_id name')
        .populate('comments.createdBy', '_id name')
        .populate('createdBy', '_id name role')
        .populate('books')
        .exec((err, collection) => {
            if (err || !collection) {
                
                return res.status(400).json({
                    error: err
                });
            }
            req.collection = collection;
            next();

        });
};

exports.findCollections = (req, res) => {
    const search = req.params.search;
    Collection.find({$or:[{name: { "$regex": search, "$options": "i" }}, {about: { "$regex": search, "$options": "i" }}]})
        .populate('createdBy', '_id name')
        .populate('comments.createdBy', '_id name')
        .populate('createdBy', '_id name role')
        .populate('books')
        .exec((err, collections) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(collections);
            
        });

}


// with pagination
exports.getCollections = async (req, res) => {
    
    // get current page from req.query or use default value of 1
    const currentPage = req.query.page || 1;
    // return 3 books per page
    const perPage = 6;
    let totalItems;

    const collections = await Collection.find()
        // countDocuments() gives you total count of books
        .countDocuments()
        .then(count => {
            totalItems = count;
            if( count > 0){
            return Collection.find()
                .skip((currentPage - 1) * perPage)
                .populate('comments', 'text created')
              .populate('comments.createdBy', '_id name')
                .populate('createdBy', '_id name')
                .populate('books')
                .limit(perPage)
                .sort({ created: -1 });
            }
        })
        .then(collections => {
            res.status(200).json(collections);
        })
        .catch(err => console.log(err));
};


exports.createCollection = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        let collection = new Collection(fields);
        let imagePath = "https://static.wixstatic.com/media/56bce3_3bf8a2fdeb32470b8971ba08c5f0933e~mv2.jpg";
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        collection.createdBy = req.profile;

        if (files.photo != undefined) {
            imagePath = files.photo.path;
        }
        cloud.uploads(imagePath).then((result) => {
            collection.photo = result.url;
            collection.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        error: err
                    });
                }
                res.json(collection);
            });
    
        });
    
    });
};

exports.collectionsByUser = (req, res) => {
    Collection.find({ createdBy: req.profile._id })
        .populate('createdBy', '_id name')
        .populate('books')
        .sort('_created')
        .exec((err, collections) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(collections);
        });
};

exports.isCreator = (req, res, next) => {
    let sameUser = req.collection && req.auth && req.collection.createdBy._id == req.auth._id;
    let adminUser = req.collection && req.auth && req.auth.role === 'admin';

    // console.log("req.book ", req.book, " req.auth ", req.auth);
    //console.log("SAMEUSER: ", sameUser, " ADMINUSER: ", adminUser);

    let isBooker = sameUser || adminUser;

    if (!isBooker) {
        return res.status(403).json({
            error: 'User is not authorized'
        });
    }
    next();
};

exports.updateCollection = (req, res, next) => {
    console.log("GASFSDFA")
    let form = new formidable.IncomingForm();
    
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        console.log(files)
        // save book
        let collection = req.collection;
        collection = _.extend(collection, fields);
        collection.updated = Date.now();

        if (files.photo) {
            console.log("FILES")
            // File upload
            if (files.photo != undefined) {
                imagePath = files.photo.path;
            }
            cloud.uploads(imagePath).then((result) => {
                console.log(result);
                collection.photo = result.url;
                Collection.findOneAndUpdate({_id: collection._id}, collection)
                .then(data=> {
                    res.json(data)
                })
                .catch(err=> {
                    console.log(err)
                    return res.status(400).json({
                        error: err
                    });
                });
        
            });
        } else {
            console.log("234")
            Collection.findOneAndUpdate({_id: collection._id}, collection)
            .then(data=> {
                res.json(data)
            })
            .catch(err=> {
                console.log(err)
                return res.status(400).json({
                    error: err
                });
            });

        }
    });
};

exports.addBook = (req, res) => {
    console.log('Hola');
    Collection.findByIdAndUpdate(req.body.collectionId, { $addToSet: { books: req.body.bookId } }, { new: true }).exec(
        (err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        }
    );
};

exports.removeBook = (req, res) => {
    Collection.findByIdAndUpdate(req.body.collectionId, { $pull: { books: req.body.bookId } }, { new: true }).exec(
        (err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        }
    );
};

exports.deleteCollection = (req, res) => {
    console.log(req)
    let collection = req.collection;
    collection.remove((err, collection) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({
            message: 'Collection deleted successfully'
        });
    });
};

exports.photo = (req, res, next) => {
 //   res.set('Content-Type', req.book.photo.contentType);
    return res.send(req.collection.photo);
};

exports.like = (req, res) => {
    Collection.findByIdAndUpdate(req.body.collectionId, { $push: { likes: req.body.userId } }, { new: true }).exec(
        (err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        }
    );
};

exports.unlike = (req, res) => {
    Collection.findByIdAndUpdate(req.body.collectionId, { $pull: { likes: req.body.userId } }, { new: true }).exec(
        (err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        }
    );
};

exports.comment = (req, res) => {
    let comment = req.body.comment;
    comment.createdBy = req.body.userId;

    Collection.findByIdAndUpdate(req.body.collectionId, { $push: { comments: comment } }, { new: true })
        .populate('comments.createdBy', '_id name')
        .populate('createdBy', '_id name')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        });
};

exports.uncomment = (req, res) => {
    let comment = req.body.comment;

    Collection.findByIdAndUpdate(req.body.collectionId, { $pull: { comments: { _id: comment._id } } }, { new: true })
        .populate('comments.createdBy', '_id name')
        .populate('createdBy', '_id name')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        });
};

exports.singleCollection = (req, res) => {
    return res.json(req.collection);
};