const express = require('express');

var path = require('path');
var bodyParser = require('body-parser');
const { SVNClient } = require('./version_control');
var urlencodedParser = bodyParser.urlencoded({ extended: false })  


var app = express();

var svn_client = new SVNClient();


const PORT = 8081;
const HOST = '0.0.0.0'

app.use('/src',express.static(path.resolve('src')));
app.use(express.static(path.resolve('dist')));

app.use('/assets',express.static('assets'));

console.log(path.resolve('dist'));

app.get('/', function(req,res){
    res.sendFile(path.resolve('dist/dashboard.html'));
});

app.get('/curr_repo', urlencodedParser, function(req,res){
    console.log(`Get request with data: ${req.body.user}`);
});
app.post('/upload_edit', urlencodedParser, function(req,res){
    var user = req.body.user;
    var editFile = req.body.editFile;
    if(user != null && editFile != null)
    {
        console.log(`POST request for user ${user}`);
    }
});
app.post('/create_repo', urlencodedParser, function(req,res){
    
    svn_client.create_new_repo(req.body.username, req.body.passwd)
        .then((result)=>{
            console.log(`Succuessfully created repo for USER: ${req.body.username}`);
            res.end("success");
        }) ;

})

var server = app.listen(PORT, HOST, function(){
    var host = server.address().address
    var port = server.address().port

    console.log(` listening at http://${host}:${port}`);

})