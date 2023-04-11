const crypto = require('crypto');
const pgp = require('pg-promise')();
const db = pgp('postgres://todo_admin:leelu_dallas_multipass_6@localhost:5432/todo');
const PS = pgp.PreparedStatement;

module.exports = {
  /**
  * Gets a list of all items or all uncompleted items.
  * @param options.completed  

  */
  getTodo: async (options) => {

    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500
    
    //compose the query
    let listTodos = {};
    let result = {};

    // create a query with a prepared statement
    if(options.completed && (options.completed.toLowerCase() === 'true'))
    {
      listTodos = new PS({name: "list-all-todos", text: 'SELECT * FROM todos'});
    } else {
      listTodos = new PS({name: "list-todos", text: 'SELECT * FROM todos WHERE completed = $1', values:false})
    }
    

   //query the database
   try {
      result = await db.any(listTodos)
    } catch (err){
      console.log(err);
      throw new Error (err)
    }
   
    return {
      status: 200,
      data: result
    };       
  },

  /**
  * Create a to-do item.

  * @param options.postTodoInlineReqUrlencoded.completeTrue means the task is complete, false means it is not.
  * @param options.postTodoInlineReqUrlencoded.task requiredText between 2 to 255 characters.

  */
  postTodo: async (options) => {

    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500

    let status = 200;
    let task = ''
    let complete = false;
    let params = options.postTodoInlineReqUrlencoded;

    // Make sure a task was submitted and is 2-355 characters
    if (params.task && (params.task.length > 1) && (params.task.length < 256)) {
      task = params.task;  
    } else {
      // set bad request header and return error message
      return {
        status: 400,
        data: {error: "You did not include a value for the task or it was too short/long (2-255 chars)."}
      };  
    }

    // Set a value for the completion status - default is false
    if (params.complete && (params.complete.toLowerCase() === 'true')){
      complete = true;
    } 

    // Generate a task ID
    let id_code = crypto.randomUUID();

    //run the insert
    try {
      result = await db.any('INSERT INTO todos (id_code, to_do, completed) VALUES ($1, $2, $3)',[id_code, task, complete]);
    } catch (err){
      console.log(err);
      throw new Error (err)
    }
   
    // compose the return value (if the query returned okay - if there's an error, it skips this) 
    let todo = {
      "idcode": id_code,
      "task": task,
      "completed": complete
    }

    // return the response
    return {
      status: status,
      data: todo
    };  
  },

  /**
  * Update a to-do item.

  * @param options.putTodoInlineReqUrlencoded.id_code required A GUID identifying an individual task.

  */
  putTodo: async (options) => {

    // Implement your business logic here...
    //
    // Return all 2xx and 4xx as follows:
    //
    // return {
    //   status: 'statusCode',
    //   data: 'response'
    // }

    // If an error happens during your business logic implementation,
    // you can throw it as follows:
    //
    // throw new Error('<Error message>'); // this will result in a 500

    let id_code = '';
    let task = ''
    let complete = '';
    let updateTodo = {};

    // validate for requiring an id code plus a task and/or completion
    var params = options.putTodoInlineReqUrlencoded;
    if(!params.id_code){
      return {
        status: 400,
        data: {error : "An id_code is required."}
      }
    }
    
    if(!params.task && !params.complete){
      return {
        status: 400,
        data: {error: "A task and/or a completion status is required."}
      }
    }

    if(params.task && !((params.task.length > 1) && (params.task.length < 256))){
      return {
        status: 400,
        data: {error: "The task is not between 2-255 characters"}
      }
    }

    //compose the query values

    id_code = params.id_code;

    if(params.task){
      task = params.task;
    }

   // Set a boolean value for the completion status if it exists
   if(params.complete) {
    state = params.complete.toLowerCase();
    if ((state === "true")||(state === 'false')){ 
      complete = (state === "true") ? true : false;
    }
   } 

   // compose a prepared query
   if(complete !== '' && task === ''){
     updateTodo = new PS({
       name: "update-todo-bool-only", 
       text: 'UPDATE todos SET completed = $1 WHERE id_code = $2', 
       values:[complete, id_code]
     });
   } else if(complete === '' && task !== ''){
    updateTodo = new PS({
      name: "update-todo-task-only", 
      text: 'UPDATE todos SET to_do = $1 WHERE id_code = $2', 
      values:[task, id_code]
    });
   } else {
    updateTodo = new PS({
      name: "update-todo-all", 
      text: 'UPDATE todos SET completed = $1, to_do = $2 WHERE id_code = $3', 
      values:[complete, task, id_code]
    });
   }


    // run the update
    try {
      result = await db.any(updateTodo);
    } catch (err){
      console.log(err);
      throw new Error (err)
    }

   // confirm the update
   query = `SELECT * FROM todos WHERE id_code = '${id_code}'`;
   try {
     response = await db.any(query);
   } catch (err){
     console.log(err);
     throw new Error (err)
  }

   data = response[0];

    return {
      status: 200,
      data: data
    };  
  },
};
