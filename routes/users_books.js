'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');

const checkAuth = function(req, res, next) {
  // Guard clause for private resources!!!! Very important
  if (!req.session.user) {
    return res.sendStatus(401);
  }

  next();
};

router.get('/users/books', checkAuth, (req, res, next) => {
  const userId = req.session.user.id;
  knex('books')
    .innerJoin('users_books', 'users_books.book_id', 'books.id')
    .where('users_books.user_id', userId)
    .then((books) => {
      res.send(books);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/users/books/:bookId', checkAuth, (req, res, next) => {
  const userId = req.session.user.id;
  const bookId = Number.parseInt(req.params.bookId);

  knex('users_books')
    .innerJoin('books', 'users_books.book_id', 'books.id')
    .where('book_id', bookId)
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
  const userId = req.session.user.id;
  const bookId = Number.parseInt(req.params.bookId);

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
          user_id: userId
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
  const userId = req.session.user.id;
  const bookId = Number.parseInt(req.params.bookId);

  knex('users_books')
    .del()
    .where('user_id', userId)
    .andWhere('book_id', bookId)
    .then((count) => {
      if (count === 0) {
        return res.sendStatus(404);
      }

      res.send({
        book_id: bookId,
        user_id: userId
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
