/* eslint-disable no-unused-vars*/
/* eslint-disable no-undef*/
const express = require("express");
var csurf = require("tiny-csrf");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csurf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  const overduetodos = await Todo.overdue();
  const duetodaytodos = await Todo.dueToday();
  const duelatertodos = await Todo.dueLater();
  const completedtodos = await Todo.completedTodo();
  if (request.accepts("html")) {
    response.render("index", {
      overduetodos,
      duetodaytodos,
      duelatertodos,
      completedtodos,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      overduetodos,
      duetodaytodos,
      duelatertodos,
      completedtodos,
    });
  }
});

app.get("/", function (request, response) {
  response.send("Hello World");
});

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE

  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
  try {
    const todos = await Todo.findAll();
    return response.send(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  try {
    await Todo.addTodo({
      title: this.request.body.title,
      dueDate: this.request.body.dueDate,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const val = Boolean(request.body.completed);
    const updatedTodo = await todo.setCompletionStatus(val);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE

  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
  const testdeletedtodo = await Todo.findByPk(request.params.id);
  try {
    if (testdeletedtodo == null) {
      return response.send(false);
    } else {
      await Todo.destroy({
        where: {
          id: request.params.id,
        },
      });
      return response.send(true);
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
