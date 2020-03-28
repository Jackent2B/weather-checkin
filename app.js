var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//to use .env
require('dotenv').config()

const Datastore = require('nedb');
//selfieDb is the name of file in which our data will get store.
//A file will get automatically genertaed named selfieDb
const database = new Datastore('weatherDb');
database.loadDatabase();

//it is needed to use fetch in server-side
const fetch=require('node-fetch');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/api',(req,res)=>{
  //'req' contains all the information that client sends to the server.
  console.log(req.body);
  let data = req.body
  let time = Date.now();
  data.time=time;
  database.insert(data);
  res.json(data);
})

app.get('/getData',(req,res)=>{
    database.find({},(err,data)=>{
      if(err){
        res.end();
        console.log(err);
      }else
      {
        res.json(data);
      }
    })  
})


app.post('/weather/:latlon',(req,res)=>{
  //'req' contains all the information that client sends to the server.
  console.log(req.body);
  let data = req.body
  let time = Date.now();
  data.time=time;
  database.insert(data);
  res.json(data);
})

app.get('/getLocation',(req,res)=>{
    database.find({},(err,data)=>{
      if(err){
        res.end();
        console.log(err);
      }else
      {
        res.json(data);
      }
    })  
})

//It is called making Proxy to overcome CORS.
app.get('/weather/:latlon',async(req,res)=>{

	//:latlon will be this ${lat},${lon}

	let latlon=req.params.latlon.split(',');
	let lat = latlon[0];
	let lon = latlon[1];
    const api_key = process.env.API_KEY;
    const weather_url = `https://api.darksky.net/forecast/${api_key}/${lat},${lon}`;
		//using fetch to send post request
		const fetch_res1 = await fetch(weather_url);
		const back1 = await fetch_res1.json();
		console.log(lat,lon);

	const air_quality_url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;	
		const fetch_res2 = await fetch(air_quality_url);
		const back2 = await fetch_res2.json();

		let backObj = {back1,back2};

		res.json(backObj);
		//console.log(back);
		// let icon = back1.currently.icon;
		// let summary = back1.currently.summary;
		// let dataTosaved={lat,lon,summary,icon};
		// database.insert(dataTosaved);
})





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
