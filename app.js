const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');    //sessions for individual user
const hbs = require('hbs');                   // for frontend
const dotenv = require('dotenv');             //to encrypt

dotenv.config({ path: './.env' });
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('equals', function (a, b) {       //to compare two values
    return a === b;
});

const app = express();
app.set('view engine', 'hbs');

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log('MYSQL connected....');
});
const publicDirectory = path.join(__dirname, './public');      //directory file  -css
const uploadsDirectory = path.join(__dirname, './uploads');    //directory file  -uploads


app.use(express.static(publicDirectory));    //files serve directly to client without processing
app.use('/uploads', express.static(uploadsDirectory));    //files serve directly to client without processing

app.use(express.urlencoded({ extended: false }));    //to encode the data coming from form submission make available in request body like username: nameFillInForm
app.use(express.json());       //same as above but make api request available in request body 
                               //request body is part where data comes from client to server
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/bucket', require('./routes/bucket'));
app.use('/api', require('./routes/itinerary'));

const PORT=process.env.PORT;
app.listen(PORT, () => {
    console.log('Server started on port 5000 => http://localhost:5000');
});