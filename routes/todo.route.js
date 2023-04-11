const express = require('express');
const todo = require('../services/todo');
const router = new express.Router();
 
router.get('/', async (req, res, next) => {
  let options = { 
    "completed": req.query.completed,
  };


  try {
    const result = await todo.getTodo(options);
    res.status(result.status || 200).send(result.data);
  }
  catch (err) {
    return res.status(500).send({
      error: err || 'Something went wrong.'
    });
  }
});
 
router.post('/', async (req, res, next) => {
  let options = { 
  };

  options.postTodoInlineReqUrlencoded = req.body;

  try {
    const result = await todo.postTodo(options);
    res.status(result.status || 200).send(result.data);
  }
  catch (err) {
    return res.status(500).send({
      error: err || 'Something went wrong.'
    });
  }
});
 
router.put('/', async (req, res, next) => {
  let options = { 
  };

  options.putTodoInlineReqUrlencoded = req.body;

  try {
    const result = await todo.putTodo(options);
    res.status(result.status || 200).send(result.data);
  }
  catch (err) {
    return res.status(500).send({
      error: err || 'Something went wrong.'
    });
  }
});

module.exports = router;