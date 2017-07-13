/**
 * Created by rpaulin on 6/4/17.
 */
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(express.static(path.join(__dirname, 'public')));


require("./firebase/firebase_routes")(app);

// let transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // secure:true for port 465, secure:false for port 587
//     auth: {
//         user: 'rpaulin1990@gmail.com',
//         pass: 'Queretaro2015'
//     }
// });

// setup email data with unicode symbols

// let mailOptions = {
//     from: 'rpaulin1990@gmail.com', // sender address
//     to: 'rpaulin1990@gmail.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world ?', // plain text body
//     html: '<b>Hello world ?</b>' // html body
// };



app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});


app.get("/",function(req,res){

    res.sendFile(path.join(__dirname,"/public/index.html"));

});

app.get("/all_current_picks",function(req,res){

    res.sendFile(path.join(__dirname,"/public/everyone_picks.html"));

});

app.get("/instructions_and_contact",function(req,res){

    res.sendFile(path.join(__dirname,"/public/Instructions.html"));

});



// var j = schedule.scheduleJob({hour: 11, minute: 49, dayOfWeek: 0}, function(){
//     transporter.sendMail(mailOptions, function(error, info) {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Message %s sent: %s', info.messageId, info.response);
//     });
// });