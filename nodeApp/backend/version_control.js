const svn = require('node-svn-ultimate');
const {config} = require("dotenv") ;
const fs = require('fs');
const axios = require('axios');

const TAG = `svn_client`;


class SVNClient {

    REPO_URL = process.env.XCLOUD_SVN;
    CLOUD_URL = process.env.XCLOUD_APACHE

    static #config_init;
    //MAKE THIS A DB variable later on. Otherwise this will get called twice when it doesn't need to be
    static #REPO_URL = () => {
        if(SVNClient.#config_init == false){
            config();
            SVNClient.#config_init = true;
        }
        return process.env.XCLOUD_IP;
    }

    
    constructor()
    {

    }

    repo_info(user, url)
    {
        var remoteRepo = this.REPO_URL + user;
    }

    async create_new_repo(user, password)
    {
        var workingDirectory = `./x-cloud/users/${user}`;
        var create_endpoint = this.CLOUD_URL +"cgi/new_repo.pl";

        var parameters = new URLSearchParams();
        parameters.append('username', user);
        parameters.append('passwd', password);

        var data = {
            username: user,
            passwd: password
        }
        
        const response = await axios.post(create_endpoint,parameters);


        if(response.statusText != 'OK'){
            console.log(`Error occured with response code ${response.ok}`);
            return -1;
        }else{
            console.log(`RESPONSE is: `);
            console.log(response.data);
        }
        //fs.mkdirSync(workingDirectory);
        this.checkout_user(user, password)

        
    }

    writeEditFile(user, editData)
    {
        var workingDirectoryFile = `./x-cloud/users/${user}/latest_edit.json`;
        fs.writeFileSync(workingDirectoryFile, editData);
        return workingDirectoryFile;

    }

    add_file(file, user, passwd)
    {
        svn.commands.add(file, {
            username: user,
            password: passwd
        },function(err){
            if(err)
            {
                console.log(`version_control::add_file::Error occurred: ${err}`);
            }
            console.log("version_control::add_file:: Added file complete");
        })
    }

    commit_changes(files, user, passwd)
    {
        svn.commands.commit(files, {
            username: user,
            password: passwd,
            params: [ '-m "New Commit"' ],
        },function(err){
            if(err)
            {
                console.log(`version_control::commit_changes::Error occurred: ${err}`);
            }
            console.log("version_control::commit_changes:: Changes Sucessfully Committed");
        })
    }
    checkout_user(user, passwd)
    {
        var workingDirectory = `./x-cloud/users/${user}`;
        var userRepo = this.REPO_URL + `/${user}`
        fs.mkdirSync(workingDirectory);
        svn.commands.checkout(userRepo, workingDirectory,{
            username: user,
            password: passwd,
        },function(err){
            console.log("version_control::checkout_user::Checkout complete");
        } );
        //I dont know if each user will have its own url yet. Will test that out.
    }
}



module.exports = {
    SVNClient:SVNClient,
}