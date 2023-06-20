const express = require('express');

var path = require('path');
var bodyParser = require('body-parser');
var url = require('url');
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
    var queryData = url.parse(req.url, true).query
    console.log(`Get request with data: ${queryData.user}`);
    res.sendFile(path.resolve('dist/repo.html'));
});
app.post('/upload_edit', urlencodedParser, function(req,res){
    var user = req.body.user;
    var password = req.body.password;
    var editFile = req.body.editFile;
    console.log("RECIEVED POST REQUEST...");
    console.log(req.body);
    if(user != null && editFile != null)
    {
        console.log(`POST request for user ${user}`);
        let filePath = svn_client.writeEditFile(user, editFile);
        svn_client.add_file(filePath, user, password);
        svn_client.commit_changes(filePath, user, password);
        //console.log('FILE:');
        //console.log(editFile);
    }

    res.end("success");
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