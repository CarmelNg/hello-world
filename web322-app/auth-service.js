const { rejects } = require('assert');
const mongoose = require('mongoose');
const { resolve } = require('path');
var Schema = mongoose.Schema;
var userSchema = new Schema({           
    "userName": {
        type : String,
        unique : true
    } ,
    "password": String,
    "email": String,
    "loginHistory": [{
      "dateTime": Date,
      "userAgent": String
    }]
  });

let User; 

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
      
        let db1 = mongoose.createConnection("mongodb://ac-zx7gktv-shard-00-01.hiyoai1.mongodb.net:27017/CarmelAssignment6%3A27017?directConnection=true&appName=mongosh+1.6.1");
     
        db1.on('error', (err)=>{
            reject(err); 
        });
        db1.once('open', ()=>{
           User = db1.model("users", userSchema);
           resolve();
        });
    });
};



module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {

        if(userData.password != userData.password2)     
        {
            reject("Passwords do not match");
        }
        else        
        {
            let newUser = new User(userData);
            newUser.save().then(() => {
                resolve();
              }).catch(err => {
                if(err.code == 11000)       
                {
                    reject("User Name already taken");
                }
                else                        
                {
                    reject("There was an error creating the user: " + err);
                }
              });
        }
    });
};


module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })          
        .exec()
        .then((users) => {
            if(users[0].password != userData.password)     
            {
                reject("Incorrect Password for user: " + userData.userName)
            }
            else if(users[0].password == userData.password)     
            {
                users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});

                User.updateOne({userName : users[0].userName}, {$set : {loginHistory : users[0].loginHistory}})
                .exec().then(() => {    resolve(users[0]);  }).catch((err) =>  reject("There was an error verifying the user: " + err     ));
            }
          
        })
        .catch((err) => {
            console.log(err);
            reject("Unable to find user: " + userData.userName)
        });
    });
};