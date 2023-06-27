
import { createApp, ref } from 'vue'
import { XStatus } from './iam.js';
import { XUser } from './iam.js';


XStatus.currUser = new XUser(currUser);
var currUser = XStatus.getCookie("user");
var passwd = XStatus.getCookie("passwd");
var req_data = {
    user: currUser,
    password: passwd,
};
var list_data, name, author, size, revision_number;
const url = 'http::/127.0.0.1:8000/curr_repo';
$.ajax({
    type: "GET",
    url: url,
    data:req_data,
    success: function(result) {
        console.log(`Loaded Current Repo with data : ${result}`);
        var results = result;
        createApp({
            setup() {
                const list_data = JSON.parse(result);
                const name = ref(list_data.name);
                const author = ref(list_data.commit_info.author);
                const size = ref(list_data.size);
                const revision_number = ref(list_data['commit_info']['$']['revision']);
              return {
                name, author,size,revision_number
              }
            }
          }).mount('#vue')

    },
    error: function(error){
        console.log(`Error occured: ${error}`)
    }
});






