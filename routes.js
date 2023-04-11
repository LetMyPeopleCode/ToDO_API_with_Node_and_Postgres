module.exports = function (app) {
  /*
  * Routes
  */
  app.use('/todo', require('./routes/todo.route'));

};
