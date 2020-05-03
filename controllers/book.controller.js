const Book = require('../models/book.model');
const mongoose = require('mongoose');
const formidable = require('formidable');
var cloud = require('../config/cloudinary.config');
var isbn = require('node-isbn');
const fs = require('fs');
const _ = require('lodash');
const ApiError = require('../models/api-error.model');



exports.bookById = (req, res, next, id) => {
    Book.findById(id)
        .populate('createdBy', '_id name')
        .populate('comments.createdBy', '_id name')
        .populate('createdBy', '_id name role')
        .select('_id title editorial isbn photo created likes comments language')
        .exec((err, book) => {
            if (err || !book) {
                return res.status(400).json({
                    error: err
                });
            }
            req.book = book;
            next();
        });
};

exports.findBooks = (req, res) => {
    const search = req.params.search || '';
    Book.find({$or:[{title: { "$regex": search, "$options": "i" }},{editorial: { "$regex": search, "$options": "i" }},{isbn: { "$regex": search, "$options": "i" }},{illustrator: { "$regex": search, "$options": "i" }}, {language: { "$regex": search, "$options": "i" }}]})
        .populate('createdBy', '_id name')
        .populate('comments.createdBy', '_id name')
        .populate('createdBy', '_id name role')
        .populate('books')
        .exec((err, books) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(books);
            
        });

}

exports.bookByISBN = (req, res) => {

    const isbn = req.params.isbn || '';
    Book.find({isbn: isbn})
        .populate('createdBy', '_id name')
        .populate('comments.createdBy', '_id name')
        .populate('createdBy', '_id name role')
        .exec((err, book) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(book);
            
        });

}

// with pagination
exports.getBooks = async (req, res) => {
    
    // get current page from req.query or use default value of 1
    const currentPage = req.query.page || 1;
    // return 3 books per page
    const perPage = 6;
    let totalItems;

    const books = await Book.find()
        // countDocuments() gives you total count of books
        .countDocuments()
        .then(count => {
            totalItems = count;
            if( count > 0){
            return Book.find()
                .skip((currentPage - 1) * perPage)
                .populate('comments', 'text created')
              .populate('comments.createdBy', '_id name')
                .populate('createdBy', '_id name')
                .select('_id title editorial created likes language photo isbn')
                .limit(perPage)
                .sort({ created: -1 });
            }
        })
        .then(books => {
            res.status(200).json(books);
        })
        .catch(err => console.log(err));
};

exports.getAllBooks = async (req, res) => {
 

    let totalItems;

    const books = await Book.find()
        // countDocuments() gives you total count of books
        .countDocuments()
        .then(count => {
            totalItems = count;
            if( count > 0){
            return Book.find()
                .populate('comments', 'text created')
                .populate('comments.createdBy', '_id name')
                .populate('createdBy', '_id name')
                .sort({ created: -1 });
            }
        })
        .then(books => {
            res.status(200).json(books);
        })
        .catch(err => console.log(err));
};


exports.createBook = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        let book = new Book(fields);
        var imagePath = "";
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        book.createdBy = req.profile;
        if (files.photo === undefined) {
            isbn.resolve(fields.isbn)
            .then(results => {   
                        console.log(results.imageLinks)
                        if(results.imageLinks.smallThumbnail.length>0)
                        {
                            imagePath = results.imageLinks.thumbnail;
                            book.photo = results.imageLinks.thumbnail;
                            book.save()
                            .then(()=> {
                                res.status(200).json(book)
                            })
                            .catch(error => {
                                if (error instanceof mongoose.Error.ValidationError) {
                                    res.status(400).json({error : error.message, book: book});
                                  } else {
                                    next(new ApiError(error.message, 500));
                                  }
                            })


                    } else {
                        book.photo = "https://cdn.pixabay.com/photo/2018/01/03/09/09/book-3057901_1280.png";
                        book.save()
                        .then(()=> {
                            res.status(200).json(book)
                        })
                        .catch(error => {
                            if (error instanceof mongoose.Error.ValidationError) {
                                next(new ApiError(error.errors));
                              } else {
                                next(new ApiError(error.message, 500));
                              }
                        })
                    }

            })
            .catch(err => console.log(err))
        } else {
            imagePath = files.photo.path;
        
        cloud.uploads(imagePath).then((result) => {
            book.photo = result.url;
            book.save()
            .then(()=> {
                res.status(200).json(book)
            })
            .catch(error => {
                if (error instanceof mongoose.Error.ValidationError) {
                    next(new ApiError(error.errors));
                  } else {
                    next(new ApiError(error.message, 500));
                  }
            })
    
        });
        }
    
    });
};

exports.booksByUser = (req, res) => {
    Book.find({ createdBy: req.profile._id })
        .populate('createdBy', '_id name')
        .select('_id title editorial created likes language photo isbn')
        .sort('_created')
        .exec((err, books) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(books);
        });
};

exports.isCreator = (req, res, next) => {
    let sameUser = req.book && req.auth && req.book.createdBy._id == req.auth._id;
    let adminUser = req.book && req.auth && req.auth.role === 'admin';

    // console.log("req.book ", req.book, " req.auth ", req.auth);
    // console.log("SAMEUSER: ", sameUser, " ADMINUSER: ", adminUser);

    let isBooker = sameUser || adminUser;

    if (!isBooker) {
        return res.status(403).json({
            error: 'User is not authorized'
        });
    }
    next();
};

// exports.updateBook = (req, res, next) => {
//     let book = req.book;
//     book = _.extend(book, req.body);
//     book.updated = Date.now();
//     book.save(err => {
//         if (err) {
//             return res.status(400).json({
//                 error: err
//             });
//         }
//         res.json(book);
//     });
// };

exports.updateBook = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // save book
        let book = req.book;
        book = _.extend(book, fields);
        book.updated = Date.now();
            
        if (files.photo) {
            // File upload
            cloud.uploads(files.photo.path).then((result) => {
                book.photo = result.url;
                book.save()
                .then(()=> {
                    res.status(200).json(book)
                })
                .catch(error => {
                    if (error instanceof mongoose.Error.ValidationError) {
                        next(new ApiError(error.errors));
                      } else {
                        next(new ApiError(error.message, 500));
                      }
                })
        
            });
        }

        book.save()
        .then(()=> {
            res.status(200).json(book)
        })
        .catch(error => {
            if (error instanceof mongoose.Error.ValidationError) {
                next(new ApiError(error.errors));
              } else {
                next(new ApiError(error.message, 500));
              }
        })
    });
};

exports.deleteBook = (req, res) => {
    let book = req.book;
    book.remove()
    .then(message => {
        if(message) { 
            res.status(204).json(book)
        } else {
            next(new ApiError('Book not found',404));
        }
    })
};

exports.photo = (req, res, next) => {
 //   res.set('Content-Type', req.book.photo.contentType);
    return res.send(req.book.photo);
};

exports.singleBook = (req, res) => {
    return res.json(req.book);
};

exports.like = (req, res) => {
    Book.findByIdAndUpdate(req.body.bookId, { $push: { likes: req.body.userId } }, { new: true }).exec(
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
    Book.findByIdAndUpdate(req.body.bookId, { $pull: { likes: req.body.userId } }, { new: true }).exec(
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

    Book.findByIdAndUpdate(req.body.bookId, { $push: { comments: comment } }, { new: true })
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

    Book.findByIdAndUpdate(req.body.bookId, { $pull: { comments: { _id: comment._id } } }, { new: true })
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

// exports.updateComment = async (req, res) => {
//     const comment = req.body.comment;
//     // const id = req.body.id;
//     const bookId = req.body.bookId;
//     const userId = req.body.userId;
//     // comment.createdBy = req.body.userId;

//     const result = await Book.findByIdAndUpdate(
//         bookId,
//         {
//             $set: {
//                 comments: {
//                     _id: comment._id,
//                     text: comment.text,
//                     createdBy: userId
//                 }
//             }
//         },
//         { new: true, overwrite: false }
//     )
//         .populate('comments.createdBy', '_id name')
//         .populate('createdBy', '_id name');
//     res.json(result);
// };

exports.updateComment = (req, res) => {
    let comment = req.body.comment;

    Book.findByIdAndUpdate(req.body.bookId, { $pull: { comments: { _id: comment._id } } }).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        } else {
            Book.findByIdAndUpdate(
                req.body.bookId,
                { $push: { comments: comment, updated: new Date() } },
                { new: true }
            )
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
        }
    });
};

/*
// update commennt by Alaki
exports.updateComment = async (req, res) => {
  const commentId = req.body.id;
  const comment = req.body.comment;
 
  const updatedComment = await Book.updateOne(
    { comments: { $elemMatch: { _id: commentId } } },
    { $set: { "comments.$.text": comment } }
  );
  if (!updatedComment)
    res.status(404).json({ message: Language.fa.NoBookFound });
 
  res.json(updatedComment);
};
// update commennt with auth
exports.updateComment = async (req, res) => {
  const commentId = req.body.id;
  const comment = req.body.comment;
  const bookId = req.params.id;
 
  const book = await Book.findById(bookId);
  const com = book.comments.map(comment => comment.id).indexOf(commentId);
  const singleComment = book.comments.splice(com, 1);
  let authorized = singleComment[0].commentedBy;
  console.log("Security Check Passed ?", req.auth._id == authorized);
 
  if (authorized != req.auth._id)
    res.status(401).json({ mesage: Language.fa.UnAuthorized });
 
  const updatedComment = await Book.updateOne(
    { comments: { $elemMatch: { _id: commentId } } },
    { $set: { "comments.$.text": comment } }
  );
  if (!updatedComment)
    res.status(404).json({ message: Language.fr.NoBookFound });
 
  res.json({ message: Language.fr.CommentUpdated });
};
 */

