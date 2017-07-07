/**
 * Created by rpaulin on 6/4/17.
 */
var firebase = require("firebase");
var path = require("path");
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');


var config = {
    apiKey: "AIzaSyBZ1EkdljPhyKZPccbmlsqZxU2bkmqvQnI",
    authDomain: "epl-pool.firebaseapp.com",
    databaseURL: "https://epl-pool.firebaseio.com",
    projectId: "epl-pool",
    storageBucket: "epl-pool.appspot.com",
    messagingSenderId: "924014493334"
};
firebase.initializeApp(config);

var admin = require("firebase-admin");

//var serviceAccount = require("../admin/epl-pool-firebase-adminsdk-ex8f3-992c6c6878.js");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: "epl-pool",
        clientEmail: "firebase-adminsdk-ex8f3@epl-pool.iam.gserviceaccount.com",
        privateKey: process.env.PRIVATE_KEY
    }),
    databaseURL: "https://epl-pool.firebaseio.com"
});

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://epl-pool.firebaseio.com"
// });


var database = firebase.database();

/// THIS WILL HELP US GET THE KEYS AND VALUES OF EACH USER
var usersRef = database.ref().child("users");

//
// var resultsRef = database.ref().child("results");

/////////// ADMIN STUFF ////////////

var db = admin.database();
var refAdmin = db.ref();
var usersRefAdmin = refAdmin.child("users");
var resultsRefAdmin = refAdmin.child("results");
var chatAdmin = refAdmin.child("chat");

/////////// ADMIN STUFF ////////////

/////////////// mailer /////////////


let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'english.premierleague.pool@gmail.com',
        pass: 'psychicoctopus'
    }
});

//process.env.USER_EMAIL
//process.env.EMAIL_PWD


// setup email data with unicode symbols
// let mailOptions = {
//     from: 'rpaulin1990@gmail.com', // sender address
//     to: 'rpaulin1990@gmail.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world ?', // plain text body
//     html: '<b>Hello world ?</b>' // html body
// };




/////////////// mailer /////////////



module.exports = function(app) {

    app.post("/resultsLastWeek",function(req,res){

        resultsRefAdmin.set({

            [req.body.gameWeek - 1]: req.body.resultsLastWeek

        });

        res.json({resultsLastWeek: req.body.resultsLastWeek})
    });

    app.post("/updateDatabase",function(req,res){
        // 1- UPDATE WEEKLY GAMES PLAYED

        usersRefAdmin.orderByKey().once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {

                var picksId = childSnapshot.val().picksPerGameWeek; // array starts at 0 so need to compensate
                var lastWeeksPicks = picksId[req.body.databaseLastGameWeek];
                var weeklyGamesPlayed = 0;

                for (var f = 0; f < lastWeeksPicks.length; f++) {
                    if (lastWeeksPicks[f] !== "undefined") {
                        weeklyGamesPlayed++;
                    }
                }
                console.log("update 1");
                usersRefAdmin.child(childSnapshot.key).child("gamesPlayedPerWeek").update({
                    [req.body.databaseLastGameWeek]: weeklyGamesPlayed
                });
            });

            // 2- UPDATE WEEKLY POINTS

            usersRefAdmin.orderByKey().once("value", function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var picksId = childSnapshot.val().picksPerGameWeek; // array starts at 0 so need to compensate
                    var lastWeeksPicks = picksId[req.body.databaseLastGameWeek];
                    var weeklyPoints = 0;

                    for (var f = 0; f < lastWeeksPicks.length; f++) {
                        if (lastWeeksPicks[f] === req.body.resultsLastWeek[f]) {
                            weeklyPoints++;
                        }
                    }
                    console.log("update 2");
                    usersRefAdmin.child(childSnapshot.key).child("pointsPerGameWeek").update({
                        [req.body.databaseLastGameWeek]: weeklyPoints
                    });
                });
                // 3- UPDATE TOTAL GAMES PLAYED
                usersRefAdmin.orderByKey().once("value", function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {

                        var pointsId = childSnapshot.val().pointsPerGameWeek;
                        var gamesPlayedId = childSnapshot.val().gamesPlayedPerWeek;
                        var totalGamesPlayed = 0;
                        var weeklyPointsArray = pointsId;
                        var weeklyGamesPlayedArray = gamesPlayedId;

                        for(var t = 0; t < weeklyPointsArray.length; t++){
                            totalGamesPlayed += parseInt(weeklyGamesPlayedArray[t]);
                        }
                        console.log("update 3");
                        usersRefAdmin.child(childSnapshot.key).update({
                            totalGamesPlayed: totalGamesPlayed
                        });
                    });

                    // 4- UPDATE TOTAL POINTS
                    usersRefAdmin.orderByKey().once("value", function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {

                            var pointsId = childSnapshot.val().pointsPerGameWeek;
                            var totalPoints = 0;
                            var weeklyPointsArray = pointsId;

                            for(var t = 0; t < weeklyPointsArray.length; t++){
                                totalPoints += parseInt(weeklyPointsArray[t]);
                            }
                            console.log("update 4");
                            usersRefAdmin.child(childSnapshot.key).update({
                                totalPointsNegative: -totalPoints,
                                totalPoints: totalPoints
                            });
                        });
                    });

                    // 4- CHECK If USER HAS 0 POINTS
                    usersRefAdmin.orderByKey().once("value", function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {

                            var pointsId = childSnapshot.val().pointsPerGameWeek;
                            var totalPoints = 0;
                            var weeklyPointsArray = pointsId;

                            for(var t = 0; t < weeklyPointsArray.length; t++){
                                totalPoints += weeklyPointsArray[t];
                            }

                            if(totalPoints === 0){
                                usersRefAdmin.child(childSnapshot.key).update({
                                    totalPointsNegative: 1000
                                });
                            }
                            console.log("update 5");
                        });
                        res.json(req.body.databaseLastGameWeek)
                    });
                });
            });
        });

    });

    app.post("/submitPicks",function(req,res) {
        usersRefAdmin.child(req.body.currentUserUid).child("picksPerGameWeek").update({
            [req.body.databaseGameWeek]: req.body.selectedTeams
        });
        res.json(req.body);
    });

    app.post("/createUser",function(req,res) {
        usersRefAdmin.child(req.body.currentUserUid).set({

            email: req.body.email,
            name: req.body.name,
            teamName: req.body.teamName,
            userUid: req.body.currentUserUid,
            picksPerGameWeek: req.body.picksArray, //// picksArray = [[undefined,undefined,...,undefined],[undefined,undefined,...,undefined], etc]
            pointsPerGameWeek: req.body.pointsArray, //// pointsArray = [0,0,0,0,...,0] 38 gameweeks, so 38 weekly points
            gamesPlayedPerWeek: req.body.gamesPlayedArray, //// TO COUNT HOW MANY GAMES A USER HAS PLAYED
            totalPoints: 0,
            totalGamesPlayed: 0

        });
        res.json(req.body);
    });

    app.post("/messageSent",function(req,res){

        chatAdmin.push({
            message: req.body.user + ": " + req.body.message
        });

        res.json("message sent");
    });

};


////////// scheduler //////////

var j = schedule.scheduleJob({hour: 9, minute: 57, dayOfWeek: 4}, function(){

    var emailArray = [];

    usersRefAdmin.orderByKey().once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {

            var emailId = childSnapshot.val().email;

            emailArray.push(emailId);

        })
    }).then(function(){



        let mailOptions = {
            from: 'english.premierleague.pool@gmail.com', // sender address
            //to: emailArray.join(), // list of receivers
            to: "rpaulin1990@gmail.com", // list of receivers
            subject: 'Hello ✔', // Subject line
            text: "Hello World ?", // plain text body
            html: '<b>Hello world ?</b>' // html body
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });


    });


});

////////// scheduler //////////