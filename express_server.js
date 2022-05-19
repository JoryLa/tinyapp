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

const userDatabase = {
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

//Regisration page
app.get('/register', (req, res) => {
  res.render('register');
});

// URLs page
app.get('/urls', (req, res) => {
  console.log(req.cookies)
  const templateVars = { 
    username: req.cookies['username'] || null,
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

// Create new URL form page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  }
  res.render("urls_new" , templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    username: req.cookies['username'],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  //console.log(shortURL);
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
  userDatabase[user.id] = user;
  res.redirect('/login');
  //const user_ID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  //userDatabase[user_ID] = user
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;  // Log the POST request body to the console
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[shortURL] = longURL;
  //console.log(urlDatabase);
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

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  const { username } = req.body;
  res.clearCookie('username', username);
  res.redirect('/urls');
})

// Catchall route handler
app.get('*', (req, res) => {
  res.status(404).send('<h1>404: This page does not exist</h1>');
});

app.listen(PORT, () => {
  console.log(`Example app listeninng on port: ${PORT}!`);
});