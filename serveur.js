// const express = require ("express");
// const path = require( 'path');
// const app = express();
// app.use (express.static(__dirname + '/dist/angular-azure')) ;
// app.get ('/*', function (req, res) {
// res. sendFile (path.join(__dirname+'/dist/angular-azure/index.html'));

// })
// app. listen (process.env.PORT) ;

const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('./dist/angular-azure/'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/angular-azure/'}),
);

app.listen(process.env.PORT || 8080);
