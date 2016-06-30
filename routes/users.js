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
    .where('book_id', bookId)
    .then((books) => {
      if (books.length === 0) {
        return res.sendStatus(400);
      }

      return knex('books')
        .where('id', bookId)
        .first()
        .then((book) => {
          res.send(book);
        });
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/users', (req, res, next) => {
  const userInfo = req.body;

  if (!userInfo.email || userInfo.email.trim() === '') {
    return res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send('Email must not be blank');
  }

  if (!userInfo.password || userInfo.password.trim() === '') {
    return res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send('Password must not be blank');
  }

  knex('users')
    // Interesting Alternate method to return true / false results
    // .select(knex.raw('1=1'))
    // .where('email', userInfo.email)
    // .first()
    // .then((exists) => {
    //   if (exists) {
    //     return res ...
    //   }
    // })
    .where('email', userInfo.email)
    .then((users) => {
      if (users.length > 0) {
        return res
          .status(400)
          .set('Content-Type', 'text/plain')
          .send('Email already exists');
      }

      bcrypt.hash(userInfo.password, 12, (hashErr, hashed_password) => {
        if (hashErr) {
          return next(err);
        }

        const newUser = {
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          email: userInfo.email,
          hashed_password: hashed_password
        };

        knex('users') // return is for the interior promise....
          .insert(newUser)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            next(err);
          });
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
