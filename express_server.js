const express = require('express');
const app = express();
const PORT = 8080;
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

//middleware
app.set('view engine', "ejs");
//app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'Jar',
  keys: ['super', 'secret', 'chocolate', 'chips']
}));

// User ID and Short URL generator function
const generateRandomString = function(length, chars) {
  let results = '';
  for (let i = length; i > 0; i--) {
    results += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return results;
};

// Look up user by email helper function
const getUserByEmail = function(email, users) {
  
  return user;
};

// User databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "alice"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "bob"
  }
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
  const userID = req.session['user_ID'];
  let userURLDB = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      userURLDB[url] = urlDatabase[url];
    }
  }
  
  const templateVars = {
    user: users[userID],
    urls: userURLDB
  };
  
  res.render('urls_index', templateVars);
});

// Create new URL form page
app.get("/urls/new", (req, res) => {
  const userID = req.session['user_ID'];
  
  if (!userID) {
    res.redirect('/login');
  }

  const templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  
  res.render("urls_new" , templateVars);
});

// Renders a page of an existing TinyURL
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session['user_ID'];
  let longURL = '';
  let shortURL = '';
  if (!userID) {
    return res.send('<h1>Please login</h1>');
  }
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === userID) {
      longURL = urlDatabase[item].longURL;
      shortURL = item;
    }
  }
  if (!longURL || !shortURL) {
    return res.send('<h1>This TinyURL does not belong to you</h1>');
  } 
  const templateVars = {
    user: users[userID],
    shortURL,
    longURL
  };
  

  res.render('urls_show', templateVars);
  /*for (let tempUser in users) {
    } else if (userID === users[tempUser].userID) {
      return res.status(400).send('<h1>Cannot access others\'s URLs</h1>');
    } else {
      res.render('urls_show', templateVars);
    }
  } */ 
});

// When TinyURL is clicked, redirects to the page of corresponding long URL
app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// POST register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if email or password are falsey
  if (!email || !password) {
    return res.status(400).send('<h1>Error 400: Please enter E-mail and Password</h1>');
  }

  // Check in email is already in use
  for (let tempUser in users) {
    const newEmail = req.body.email;
    if (newEmail === users[tempUser].email) {
      return res.status(400).send('<h1>Error 400: E-mail already in use</h1>');
    }
  }

  // Create new user object
  const id = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = {
    id,
    email,
    password: hash
  };

  // Update users database
  users[id] = newUser;
  req.session.user_ID = newUser.id;

  res.redirect('/urls');
});

// POST login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if email and password match
  for (let user in users) {
    if (email === users[user].email && bcrypt.compareSync(password, users[user].password)) {
      req.session.user_ID = users[user].id;
      //res.cookie('user_ID', users[user].id);
      return res.redirect('/urls');
    }
  }
  return res.status(404).send('<h1>404: E-mail or Password not found</h1>');
});

// Creates the string that will be used for a TinyURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session['user_ID']
  };

  res.redirect('/urls/' + shortURL);
});

// Changes the long URL of a corresponding TinyURL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: req.session['user_ID']
  };

  res.redirect('/urls');
});

// Deletes a saved TinyURL
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Logs a user out of site
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Catchall route handler
app.get('*', (req, res) => {
  res.status(404).send('<h1>404: This page does not exist</h1>');
});

app.listen(PORT, () => {
  console.log(`Example app listeninng on port: ${PORT}!`);
});