const express = require('express');
const {
    getBooks,
    createBook,
    booksByUser,
    bookById,
    isCreator,
    updateBook,
    deleteBook,
    photo,
    singleBook,
    like,
    unlike,
    comment,
    uncomment,
    updateComment,
    findBooks,
    getAllBooks,
    bookByISBN
} = require('../controllers/book.controller');
const { requireSignin } = require('../controllers/auth.controller');
const { userById } = require('../controllers/user.controller');
const { createBookValidator } = require('../validator');

const router = express.Router();


router.get('/books', getBooks);

router.get('/books/all', getAllBooks);

// like unlike
router.put('/book/like', requireSignin, like);
router.put('/book/unlike', requireSignin, unlike);

// comments
router.put('/book/comment', requireSignin, comment);
router.put('/book/uncomment', requireSignin, uncomment);
router.put('/book/updatecomment', requireSignin, updateComment);

// book routes
router.post('/book/new/:userId', requireSignin, createBook, createBookValidator);
router.get('/books/by/:userId', requireSignin, booksByUser)
router.get('/book/isbn/:isbn', requireSignin, bookByISBN)
router.get('/books/:search', findBooks);
router.get('/book/:bookId', singleBook);
router.put('/book/:bookId', requireSignin, isCreator, updateBook);
router.delete('/book/:bookId', requireSignin, isCreator, deleteBook);
// photo
router.get('/book/photo/:bookId', photo);

// any route containing :userId, our app will first execute userById()
router.param('userId', userById);
// any route containing :bookId, our app will first execute bookById()
router.param('bookId', bookById);


module.exports = router;