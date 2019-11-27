const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql');
const bodyParser = require('body-parser');

const connection = mysql.createConnection({
  host:'localhost',
  user:'chiel',
  password:'chiel',
  database:'xyz'
});

connection.connect((err) => {
  if(err) throw err;
  console.log('connected to database');
});

app.listen(port, () => {
  console.log('server running on port: ', port);
});

app.use(bodyParser.json());

app.use(express.static('public'));

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//Homepage
app.get('/', (req, res) => {
  res.send('public/index.html');
})
//airplane crud
//post
app.post('/api/airplane', (req,res) => {
  let content = req.body;
  //console.log(content.regnr);
  connection.query('SELECT * FROM airplane WHERE regnr = ?', content.regnr, (err1, result1) => {
    if(err1) throw err1;
    if(result1.length > 0){
      res.status(403).send(`An airplane with the registration number ${result1[0].regnr} already exists!`);
    }
    else{
      connection.query('INSERT INTO airplane SET ?', content, (err, result) => {
        if(err) throw err;
        res.send(result);
      });
    }
  });
});
//get all
app.get('/api/airplane', (req,res) => {
  res.setHeader('Content-Type','application/json');
  connection.query('SELECT * FROM airplane', (err,airplanes) => {
    if(err) throw err;
    res.send(airplanes);
  });
});
//get all
app.get('/api/airplane2', (req,res) => {
  res.setHeader('Content-Type','application/json');
  connection.query('SELECT airplane.id, regnr, fuel, location, airfield.name FROM airplane INNER JOIN airfield ON airplane.location = airfield.id', (err,airplanes) => {
    if(err) throw err;
    res.send(airplanes);
  });
});

//get by id
app.get('/api/airplane/:id', (req, res) => {
  let id = +req.params.id;
  connection.query('SELECT * FROM airplane where id=?', id, (err, rows) => {
    if(err) throw err;
    let airplane = rows[0];
    if (airplane) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(airplane));
    }
    else {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).end();
    }
  });
});
//delete by id
app.delete('/api/airplane/:id', (req, res) => {
  let id = req.params.id;
  connection.query('DELETE FROM airplane WHERE id = ?', id, (err,result) => {
    if(err) throw err;
    res.status(204).end();
  });
});
//put by id
app.put('/api/airplane/:id', (req, res) =>  {
  let id = req.params.id;
  let inputUser = req.body;
  connection.query(`SELECT * FROM airplane WHERE NOT id = ${id} AND regnr = '${inputUser.regnr}'`, (err, response) => {
    if(response.length > 0){
      res.status(403).end();
    }
    else{
      connection.query('UPDATE airplane SET ? WHERE id = ?', [inputUser, id], (err1, response1) => {
        if (err1) throw err1;
        connection.query('SELECT * FROM airplane WHERE id = ?', id, (err2, updatedAirplane) => {
          if(err2) throw err2;
          res.send(updatedAirplane[0]);
        });
      });
    }
  });
});
//refuel
app.put('/api/airplane/refuel/:id', (req, res) => {
  const id = req.params.id;
  connection.query('UPDATE airplane SET fuel = 5000 WHERE id = ?', id, (err, response) => {
    if(err) throw err;
    res.status(200).end();
  });
});
//airfield crud
//post
app.post('/api/airfield', (req,res) => {
  let content = req.body;
  connection.query('INSERT INTO airfield SET ?', content, (err, result) => {
    if(err) throw err;
    res.send(result);
  });
});
//get all
app.get('/api/airfield', (req,res) => {
  res.setHeader('Content-Type','application/json');
  connection.query('SELECT * FROM airfield', (err,airfields) => {
    if(err) throw err;
    res.send(airfields);
  });
});
//get by id
app.get('/api/airfield/:id', (req, res) => {
  let id = +req.params.id;
  connection.query('SELECT * FROM airfield where id=?', id, (err, rows) => {
    if(err) throw err;
    let airplane = rows[0];
    if (airplane) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(airplane));
    }
    else {
      res.setHeader('Content-Type', 'application/json');
      res.status(404).end();
    }
  });
});
//delete by id
app.delete('/api/airfield/:id', (req, res) => {
  let id = req.params.id;
  connection.query('DELETE FROM airfield WHERE id = ?', id, (err,result) => {
    if(err) throw err;
    res.status(204).end();
  });
});
//put by id
app.put('/api/airfield/:id', (req, res) =>  {
  let id = req.params.id;
  let inputUser = req.body;
  connection.query('UPDATE airfield SET ? WHERE id = ?', [inputUser, id], (err, response) => {
    if (err) throw err;
    connection.query('SELECT * FROM airfield WHERE id = ?', id, (err2, updatedAirplane) => {
      if(err2) throw err2;
      res.send(updatedAirplane[0]);
    });
  });
});
