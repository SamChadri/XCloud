const express = require('express');

var path = require('path');
var app = express();

const PORT = 8081;
const HOST = '0.0.0.0'

app.use('/src',express.static(path.resolve('src')));
app.use(express.static(path.resolve('dist')));

app.use('/assets',express.static('assets'));

console.log(path.resolve('dist'));

app.get('/', function(req,res){
    res.sendFile(path.resolve('dist/dashboard.html'));
});

var server = app.listen(PORT, HOST, function(){
    var host = server.address().address
    var port = server.address().port

    console.log(` listening at http://${host}:${port}`);

})