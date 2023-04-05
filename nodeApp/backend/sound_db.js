const { MongoClient, TopologyDescription } = require('mongodb');
const {config} = require("dotenv") ;

class XC_Database 
{
//Determine what these are later on
    #svnData
    #users
    #assets
    #projectFiles
    #metaData
    static #config_init;

    static #uri = () => {
        if(XC_Database.#config_init == false){
            config();
            XC_Database.#config_init = true;
        }
        return process.env.DB_URI;
    }
    

    
    async connectToCluster(uri){
        try{
            console.log(`${TAG}::connectToCluster():: Cluster Uri ${uri}`);
            this.#mongoClient = new MongoClient(uri);
            console.log(`${TAG}::connectToCluster()::Connecting to XCloud Database cluster...`);
            await this.#mongoClient.connect();
            console.log(`${TAG}::connectToCluster()::Successfully connected to JLMongoDB cluster...`);
        
        }catch (error) {
            console.error(`Connection to MongoDB Atlas failed`, error);
            process.exit();
        }
    }
    constructor()
    {
        this.connectToCluster(this.uri());
        this.#svnData = this.#mongoClient.db('svn_data');
        this.#users = this.#mongoClient.db('users');
        this.#assets = this.#mongoClient.db('assets');
        this.#projectFiles = this.#mongoClient.db('project_files')
    }

    register_svn_user(url, user)
    {
        
    }


    get_user_repo(user)
    {
        //TODO: Implement later;
        return ''
    }

    
}