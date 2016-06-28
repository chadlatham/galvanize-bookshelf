'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('books', (table) => {
    table.increments();
    table.integer('author_id')
      .notNullable()
      .references('id')
      .inTable('authors')
      .onDelete('CASCADE');
    table.string('title').notNullable().defaultTo('');
    table.string('genre').notNullable().defaultTo('');
    table.text('description').notNullable().defaultTo('');
    table.text('cover_url').notNullable().defaultTo('');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('books');
};

// 'use strict'
// ​
// exports.up = function(knex) {
//   return knex.schema.createTable('books', (table) => {
//     table.increments();
//     table
//     .integer('author_id')
//     .notNullable()
//     .references('id')
//     .inTable('authors')
//     .onDelete('CASCADE');
//     table.string('title').notNullable().defaultTo('');
//     table.string('genre').notNullable().defaultTo('');
//     table.text('description').notNullable().defaultTo('');
//     table.text('cover_url').notNullable().defaultTo('');
//     table.timestamps(true, true);
//   });
// };
// ​
// exports.down = function(knex) {
//   return knex.schema.dropTable('books')
// };
