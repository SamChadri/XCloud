const svn = require('node-svn-ultimate');
const {config} = require("dotenv") ;


class SVNClient {

    REPO_URL = process.env.XCLOUD_IP;

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
        this.REPO_URL();
    }


    checkout_user(user, url)
    {
        //I dont know if each user will have its own url yet. Will test that out.
    }
}



svnUltimate.commands.checkout( REPO_URL, './xcloud', function( err ) {
    console.log( "Checkout complete" );
} );