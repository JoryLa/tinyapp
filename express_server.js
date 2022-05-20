const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { response } = require('express');
const morgan = require('morgan');

//middleware
app.set('view engine', "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

const generateRandomString = function(length, chars) {
  let results = '';
  for (let i = length; i > 0; i--) {
    results += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return results;
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  'alice': {
    id: 'alice',
    email: 'a@a.com',
    password: 'aaaa'
  },
  'bob': {
    id: 'bob',
    email: 'b@b.com',
    password: 'bbbb'
  },
};

app.get('/', (req, res) => {
  res.render('home');
});

//Regisration page
app.get('/register', (req, res) => {
  res.render('register');
});

//Login page
app.get('/login', (req, res) => {
  res.render('login');
});

// URLs page
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_ID'];
  const templateVars = { 
    user: users[userID],
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

// Create new URL form page
app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_ID'];
  const templateVars = {
    user: users[userID],
    urls: urlDatabase
  }
  res.render("urls_new" , templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_ID'];
  const templateVars = { 
    user: users[userID],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.post('/register', (req, res) => {
  const user = {
    id: generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    email: req.body.email,
    password: req.body.password
  }
  if (!user.email || !user.password) {
    return res.status(400).send('<h1>Error 400: Please enter E-mail and Password</h1>');
  };

  //const newEmail = Object.values(users).find(user => user.email === email)
  for (let tempUser in users) {
    const newEmail = req.body.email;
    if (newEmail === users[tempUser].email) {
    return res.status(400).send('<h1>Error 400: E-mail already in use</h1>');
    }
  };

  users[user.id] = user;
  res.cookie('user_ID', user.id);
  res.redirect('/urls');
  console.log(users);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let user in users) {
    if (email === users[user].email && password === users[user].password) {
      users[user.id] = user;
      res.cookie('user_ID', user.id);
      res.redirect('/urls');
    }
  }
  return res.status(404).send('<h1>404: E-mail or Password not found</h1>')

  /*const user = Object.values(users).find(user => user.email === email)
  res.cookie('user_ID', user);
  res.redirect('/urls');*/
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;  // Log the POST request body to the console
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/');
})

// Catchall route handler
app.get('*', (req, res) => {
  res.status(404).send('<h1>404: This page does not exist</h1>');
});

app.listen(PORT, () => {
  console.log(`Example app listeninng on port: ${PORT}!`);
});