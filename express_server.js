const express = require('express');
const app = express();
const PORT = 8080;

//middleware
const morgan = require('morgan');
app.use(morgan('dev'));
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const generateRandomString = function(length, chars) {
  let results = '';
  for (let i = length; i > 0; i--) {
    results += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return results;
};
//console.log(generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));


app.set('view engine', "ejs");

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;  // Log the POST request body to the console
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[shortURL] = longURL;
  //console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);
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

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
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

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

/*app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
});*/

// Catchall route handler
app.get('*', (req, res) => {
  res.status(404).send('<h1>404: This page does not exist</h1>');
});

app.listen(PORT, () => {
  console.log(`Example app listeninng on port: ${PORT}!`);
});