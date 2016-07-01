'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

const checkAuth = function(req, res, next) {
  // Guard clause for private resources!!!! Very important
  if (!req.session.userId) {
    return res.sendStatus(401);
  }

  next();
};

router.get('/users/books', checkAuth, (req, res, next) => {
  knex('books')
    .innerJoin('users_books', 'users_books.book_id', 'books.id')
    .where('users_books.user_id', req.session.userId)
    .then((books) => {
      res.send(books);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/users/books/:bookId', checkAuth, (req, res, next) => {
  const bookId = Number.parseInt(req.params.bookId);

  knex('books')
    .innerJoin('users_books', 'users_books.book_id', 'books.id')
    .where({
      'book_id': bookId,
      'users_books.user_id': req.session.userId
    })
    .first()
    .then((book) => {
      if (!book) {
        return res.sendStatus(404);
      }

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/users/books/:bookId', checkAuth, (req, res, next) => {
  const bookId = Number.parseInt(req.params.bookId);

  if (Number.isNaN(bookId)) {
    return next();
  }

  knex('books')
    .where('id', bookId)
    .first()
    .then((book) => {
      if (!book) {
        return res.sendStatus(404);
      }

      return knex('users_books')
        .insert({
          book_id: bookId,
          user_id: req.session.userId
        }, '*')
        .then((newEntries) => {
          res.send(newEntries[0]);
        });
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/users/books/:bookId', checkAuth, (req, res, next) => {
  const bookId = Number.parseInt(req.params.bookId);

  if (Number.isNaN(bookId)) {
    return next();
  }

  knex('users_books')
    .del()
    .where('user_id', req.session.userId)
    .andWhere('book_id', bookId)
    .then((count) => {
      if (count === 0) {
        return res.sendStatus(404);
      }

      res.send({
        book_id: bookId,
        user_id: req.session.userId
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
