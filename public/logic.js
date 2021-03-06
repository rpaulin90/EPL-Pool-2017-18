/**
 * Created by rpaulin on 6/4/17.
 */

$(document).ready(function() {

    console.log("Hello there! If you would like to help me improve this page please email me at rpaulin1990@gmail.com");

    //// INITIALIZE FIREBASE
    var config = {
        apiKey: "AIzaSyBZ1EkdljPhyKZPccbmlsqZxU2bkmqvQnI",
        authDomain: "epl-pool.firebaseapp.com",
        databaseURL: "https://epl-pool.firebaseio.com/",
        storageBucket: "epl-pool"
    };

    firebase.initializeApp(config);

    var database = firebase.database();

/// THIS WILL HELP US GET THE KEYS AND VALUES OF EACH USER
    var usersRef = database.ref().child("users");

    var chatRef = database.ref().child("chat");

    //var resultsRef = database.ref().child("results");

// INITIALIZE DROPDOWN

    $('.ui.dropdown')
        .dropdown()
    ;

// OUR GAME OBJECT, WHERE WE STORE INFORMATION FROM THE USER
// THIS INFORMATION WILL LATER BE PUSHED INTO FIREBASE
    var game = {
        email: "",
        name: "",
        teamName: "",
        userKeyNode: "",
        currentUserUid: "",
        thisWeekPick: [],
        totalPoints: 0,
        fixtures:[],
        new_user: false

    };


///////// OBTAINING CURRENT GAMEWEEK ///////////

    var GWArray = ["2017-08-11T18:45:00Z", "08/13/2017", "2017-08-19T11:30:00Z", "08/21/2017", "2017-08-26T11:30:00Z", "08/27/2017", "2017-09-09T11:30:00Z", "09/11/2017", "2017-09-15T19:00:00Z", "09/17/2017", "2017-09-23T11:30:00Z", "09/25/2017", "2017-09-30T11:30:00Z", "10/01/2017", "2017-10-14T11:30:00Z", "10/16/2017", "2017-10-20T19:00:00Z", "10/23/2017", "2017-10-28T11:30:00Z", "10/30/2017", "2017-11-04T12:30:00Z", "11/05/2017", "2017-11-18T12:30:00Z", "11/20/2017", "2017-11-24T20:00:00Z", "11/26/2017", "2017-11-28T19:45:00Z", "11/29/2017", "2017-12-02T12:30:00Z", "12/02/2017", "2017-12-09T12:30:00Z", "12/10/2017", "2017-12-12T19:45:00Z", "12/13/2017", "2017-12-16T15:00:00Z", "12/16/2017", "2017-12-23T15:00:00Z", "12/23/2017", "2017-12-26T15:00:00Z", "12/26/2017", "2017-12-30T15:00:00Z", "12/30/2017", "2018-01-01T15:00:00Z", "01/01/2018", "2018-01-13T15:00:00Z", "01/13/2018", "2018-01-20T15:00:00Z", "01/20/2018", "2018-01-30T19:45:00Z", "01/31/2018", "2018-02-03T15:00:00Z", "02/03/2018", "2018-02-10T15:00:00Z", "02/10/2018", "2018-02-24T15:00:00Z", "02/24/2018", "2018-03-03T15:00:00Z", "03/03/2018", "2018-03-10T15:00:00Z", "03/10/2018", "2018-03-17T15:00:00Z", "03/17/2018", "2018-03-31T14:00:00Z", "03/31/2018", "2018-04-07T14:00:00Z", "04/07/2018", "2018-04-14T14:00:00Z", "04/14/2018", "2018-04-21T14:00:00Z", "04/21/2018", "2018-04-28T14:00:00Z", "04/28/2018", "2018-05-05T14:00:00Z","05/05/2018", "2018-05-13T14:00:00Z", "05/13/2018"];


    currentDate = moment().format('LT');
    currentTime = moment().format('l');

    var x = 0;
    var convertedDate = moment(new Date(GWArray[x]));

    while (moment(convertedDate).diff(moment(), "seconds") <= 0) {
        x += 2;
        convertedDate = moment(new Date(GWArray[x]));
    }

    var gameWeek = 1 + (x / 2);

    if(gameWeek > 38){
        gameWeek = 39;
    }
    //gameWeek = 1;
    var seasonOver = false;

    var selectedTeams = [];

    //var incompleteSelection = false;
    var resultsLastWeek = [];

    var first_game = GWArray[x];

// THIS FUNCTION CREATES A TABLE WITH THE PICK OPTIONS FOR NEXT MATCHDAY
// WE ALSO OBTAIN ALL NECESSARY INFORMATION FROM THE API TO USE IN OTHER SECTIONS (MODALS)
    var makePicksTable = function () {
        $("#picksContainer").empty();
        //$("#game-results").empty();
        //$("#yourPicks").empty();
        //$("#yourPicksCurrent").empty();


        $.ajax({
            headers: {'X-Auth-Token': '43d2319104c54b0c9cf2d5679ab2ae5d'},
            url: 'https://api.football-data.org/v1/competitions/445/fixtures',
            //url: 'https://api.football-data.org/v1/competitions/426/fixtures',
            dataType: 'json',
            type: 'GET'
        }).done(function (response) {
            var matchHolder = [];
            game.fixtures = response.fixtures;

            var headRow = $("<tr>");
            //var gameNumberRow = $("<th>").text("GAME").addClass("center aligned").css("font-weight","bold");
            var headHome = $("<th>").text("HOME").addClass("center aligned").css("font-weight","bold");
            var headDraw = $("<th>").text("").addClass("center aligned");
            var headAway = $("<th>").text("AWAY").addClass("center aligned").css("font-weight","bold");
            //headRow.append(gameNumberRow);
            headRow.append(headHome);
            headRow.append(headDraw);
            headRow.append(headAway);
            $("#picksContainer").append(headRow);

            //// NEW STUFF
            let sortedFixturesArray = [];

            for (let y = 0; y < response.fixtures.length; y++){

                if (response.fixtures[y].matchday === gameWeek) {
                    sortedFixturesArray.push(response.fixtures[y]);
                }

            }

            let compare = function (a,b) {
                if (a._links.self.href < b._links.self.href)
                    return -1;
                if (a._links.self.href > b._links.self.href)
                    return 1;
                return 0;
            }

            sortedFixturesArray.sort(compare);


            /// NEW STUFF

            let sortedArrayResults = [];

            for (var f = 0; f < response.fixtures.length; f++) {

                if ((response.fixtures[f].matchday === gameWeek - 1)) {

                    sortedArrayResults.push(response.fixtures[f]);

                }
            }

            sortedArrayResults.sort(compare);

            //JUST ADDED
            //var first_game = "";
            var index = 0;
            //for (var i = 0; i < response.fixtures.length; i++) {
            for (var i = 0; i < sortedFixturesArray.length; i++) {
                //if (response.fixtures[i].matchday === gameWeek && (response.fixtures[i].status === "TIMED" || response.fixtures[i].status === "SCHEDULED")) {
                //if (response.fixtures[i].matchday === gameWeek && response.fixtures[i].status === "FINISHED") {
                // if (response.fixtures[i].matchday === gameWeek) {
                //     if(index === 0){
                //         first_game = response.fixtures[i].date
                //     }


                    matchHolder.push(i);
                    matchToRadio = game.thisWeekPick[gameWeek - 1][index];
                    //Output
                    var newRow = $('<tr class="radio-group">');
                    var newColumn;

                    //var value = response.fixtures[matchHolder[matchHolder.length - 1]].homeTeamName;
                    var value = sortedFixturesArray[matchHolder[matchHolder.length - 1]].homeTeamName;

                    newColumn = $('<td class="radio six wide center aligned" value="' + value + '" name="' + index + '">' + value + '</td>');
                    if (value === matchToRadio) {
                        newColumn.addClass('selected');
                    }
                    newRow.append(newColumn);
                    value = "DRAW";
                    newColumn = $('<td class="radio four wide center aligned" value="' + value + '" name="' + index + '">' + value + '</td>');
                    if (value === matchToRadio) {
                        newColumn.addClass('selected');
                    }
                    newRow.append(newColumn);
                    //value = response.fixtures[matchHolder[matchHolder.length - 1]].awayTeamName;
                    value = sortedFixturesArray[matchHolder[matchHolder.length - 1]].awayTeamName;
                    newColumn = $('<td class="radio six wide center aligned" value="' + value + '" name="' + index + '">' + value + '</td>');
                    if (value === matchToRadio) {
                        newColumn.addClass('selected');
                    }
                    newRow.append(newColumn);

                    selectedTeams.push(matchHolder.length - 1);
                    index++;

                    $("#picksContainer").append(newRow);
                //}
            }

            $('#picksContainer .radio-group .radio').click(function(){
                $(this).parent().find('.radio').removeClass('selected');
                $(this).addClass('selected');
                var val = $(this).attr('value');
            });

            $("#loader").addClass("hidden");

            // making the last week's results and picks info section (EXAMPLE: SWANSEA 1 - 0 SUNDERLAND /// PICK: SWANSEA)
            //for (var e = 0; e < response.fixtures.length; e++) {
            for (var e = 0; e < sortedArrayResults.length; e++) {
                // if ((response.fixtures[e].matchday === gameWeek-1) && (response.fixtures[e].status === "FINISHED" || response.fixtures[e].status === "IN_PLAY")) {
                    //if ((response.fixtures[e].matchday === gameWeek-1)) {
                    var game_titles = $("<th style='text-align: center'>");
                    game_titles.append("<p>" + sortedArrayResults[e].homeTeamName + ": " + sortedArrayResults[e].result.goalsHomeTeam + "</p>" + "<p> vs </p>" + "<p>" + sortedArrayResults[e].awayTeamName + ": " + sortedArrayResults[e].result.goalsAwayTeam + "</p>");
                    $("#everyone-titles").append(game_titles);
                //}
            }

            /// GETTING TIME REMAINING BEFORE PICK SUBMISSION DEADLINE
            var startTime = moment(new Date(first_game));

            timeDiff = moment(startTime).diff(moment(), "seconds");

            var currentTime = Date.parse(new Date());
            var deadline = new Date(currentTime + timeDiff*1000);

            var getTimeRemaining = function(endtime){

                //time remaining in milliseconds between now and the end
                var t = Date.parse(endtime) - Date.parse(new Date());

                var hours = Math.floor(t/1000/60/60);

                //convert milliseconds to minutes. Whatever is cut out from using the floor method, will be displayed in seconds
                var minutes = Math.floor((t/1000/60)%60);

                //convert milliseconds remaining to seconds
                var seconds = Math.floor((t/1000)%60);

                //make a reusable object that give us easy access to the values of minutes and seconds at any point in time
                return {

                    "total": t,
                    "hours": hours,
                    "minutes": minutes,
                    "seconds": seconds

                };

            };

            var timeInterval;

            var startTimer = function(id,endtime){

                function updateClock(){
                    var time = getTimeRemaining(endtime);

                    $(id).html("Time remaining (hr:min:sec): " + time.hours + ":" + ('0' + time.minutes).slice(-2)+ ":" + ('0'+time.seconds).slice(-2));

                    if(time.total <= 0){
                        location.reload();
                    }
                }

                updateClock();

                timeInterval = setInterval(updateClock,1000);

            };

            startTimer("#time-remaining",deadline);


            // OBTAINING RESULTS FROM LAST WEEK (E.G. DETERMINE WHO WON OR IF IT WAS A DRAW)

            if(gameWeek !== 1) {

                //for (var f = 0; f < response.fixtures.length; f++) {
                for (var f = 0; f < sortedArrayResults.length; f++) {
                    // if ((response.fixtures[f].matchday === gameWeek - 1) && (response.fixtures[f].status === "FINISHED" || response.fixtures[f].status === "IN_PLAY")) {
                     if (sortedArrayResults[f].status === "FINISHED" || sortedArrayResults[f].status === "IN_PLAY") {

                        // IF HOME TEAM WON
                        if (sortedArrayResults[f].result.goalsHomeTeam > sortedArrayResults[f].result.goalsAwayTeam) {
                            resultsLastWeek.push(sortedArrayResults[f].homeTeamName);
                        }

                        // IF AWAY TEAM WON
                        else if (sortedArrayResults[f].result.goalsHomeTeam < sortedArrayResults[f].result.goalsAwayTeam) {
                            resultsLastWeek.push(sortedArrayResults[f].awayTeamName);
                        }

                        // IF IT WAS A DRAW
                        else if (sortedArrayResults[f].result.goalsHomeTeam === sortedArrayResults[f].result.goalsAwayTeam) {
                            resultsLastWeek.push("DRAW");
                        }
                    }
                    else if(sortedArrayResults[f].status === "TIMED" || sortedArrayResults[f].status === "SCHEDULED" || sortedArrayResults[f].status === "POSTPONED"){
                        resultsLastWeek.push("NOT STARTED");
                    }
                }

                //// SETTING THE RESULTS AS AN ARRAY IN FIREBASE

                $.post("/resultsLastWeek", {resultsLastWeek: resultsLastWeek, gameWeek: gameWeek}, function (data) {

                    updateDatabase();
                });
            }


            // EVERYONE'S PICKS
            if(gameWeek === 1){

                $("#everyone-modal").css("display","none");
                $("#no_games_reminder").css("display","block");

            }else {
                $("#everyone_pick_h3").text("Gameweek " + (gameWeek-1) + " picks");
                usersRef.orderByKey().once("value", function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        var keyId = childSnapshot.val();
                        var user_row = $("<tr>");
                        var user_name = $("<td style='text-align: center; background-color: lightgray'>");
                        user_name.css("font-weight", "bold");
                        user_name.append(keyId.name);
                        user_row.append(user_name);

                        for (var l = 0; l < keyId.picksPerGameWeek[gameWeek - 2].length; l++) {

                            var pick = $("<td style='text-align: center; font-weight: bold'>");

                            pick.html(keyId.picksPerGameWeek[gameWeek - 2][l]);
                            if(keyId.picksPerGameWeek[gameWeek - 2][l] === resultsLastWeek[l]){
                                pick.css("background-color","dodgerblue");
                            }

                            user_row.append(pick);
                            $("#everyone-table").append(user_row);

                        }

                    })
                });

            }

            $("#gameweeks-picks-header").html('Your gameweek ' + gameWeek + ' picks');
        });

    };

    ////////////////////// FUNCTION TO UPDATE DATABASE /////////////////////////////

    var updateDatabase = function(){
        if (gameWeek !== 1) { // IN GAMEWEEK 1, THERE IS NO LAST WEEK RESULTS
            var databaseLastGameWeek = (gameWeek - 2).toString();

            $.post("/updateDatabase", {databaseLastGameWeek: databaseLastGameWeek,resultsLastWeek: resultsLastWeek}, function (data) {


            });

        }
    };

    /////////////////////////////////////////////////////////////////////////////

    //////// MAKING A RANKING TABLE BY TAKING USER'S TOTAL POINTS AS A REFERENCE/////////

    var makeRankingsTable = function(){
        $(".rankings").empty();

        var counter = 1;

        usersRef.orderByChild("totalPointsNegative").once("value",function(snapshot){
            snapshot.forEach(function (childSnapshot) {



                var userID = childSnapshot.val();
                var row = $("<tr>");
                var place = $("<td>");
                var week = $("<td>");
                var team_name = $("<td>");
                var teamOwner = $("<td>");
                var guessesSubmitted = $("<td>");
                var totalCorrect = $("<td>");
                var correctThisWeek = $("<td>");
                var correctThisMonth = $("<td>");

                place.append(counter);
                week.append(gameWeek-1);
                team_name.append(userID.teamName);
                teamOwner.append(userID.name);
                guessesSubmitted.append(userID.totalGamesPlayed);
                correctThisWeek.append(userID.pointsPerGameWeek[gameWeek-2]);
                if(gameWeek <= 4) {
                    correctThisMonth.append(userID.monthlyPoints[0]);
                }
                else if(gameWeek <= 8) {
                    correctThisMonth.append(userID.monthlyPoints[1]);
                }
                else if(gameWeek <= 11) {
                    correctThisMonth.append(userID.monthlyPoints[2]);
                }
                else if(gameWeek <= 15) {
                    correctThisMonth.append(userID.monthlyPoints[3]);
                }
                else if(gameWeek <= 22) {
                    correctThisMonth.append(userID.monthlyPoints[4]);
                }
                else if(gameWeek <= 26) {
                    correctThisMonth.append(userID.monthlyPoints[5]);
                }
                else if(gameWeek <= 29) {
                    correctThisMonth.append(userID.monthlyPoints[6]);
                }
                else if(gameWeek <= 33) {
                    correctThisMonth.append(userID.monthlyPoints[7]);
                }
                else if(gameWeek <= 37) {
                    correctThisMonth.append(userID.monthlyPoints[8]);
                }
                else {
                    correctThisMonth.append(userID.monthlyPoints[9]);
                }

                totalCorrect.append(userID.totalPoints);

                row.append(place);
                row.append(week);

                row.append(team_name);
                row.append(teamOwner);
                row.append(guessesSubmitted);
                row.append(correctThisWeek);
                row.append(correctThisMonth);
                row.append(totalCorrect);
                $("#rankings").append(row);

                counter++;
            });
        });
        $(".rankingsDiv").css("display", "block");
    };

    ///////// USING THE WEEKLY POINTS ARRAY IN FIREBASE TO CREATE A LINE CHART OF THE USER'S PERFORMANCE /////////

    var makeWeeklyPointsGraph = function(){

        $("#canvas").empty();

        usersRef.orderByKey().equalTo(game.currentUserUid).once("value", function (snapshot) {

            snapshot.forEach(function (childSnapshot) {

                var pointsId = childSnapshot.val().pointsPerGameWeek;
                var weeklyPointsArray = [];
                var gameWeeks = [];

                for(var g = 0; g < gameWeek-1; g++){
                    weeklyPointsArray.push(pointsId[g]);
                    gameWeeks.push(g + 1);
                }

                usersRef.orderByKey().once("value", function (snapshot_2) {

                    var arrayOfArrays = [];

                    snapshot_2.forEach(function (childSnapshot_2) {
                        var currentArray = []
                        var pointsId_2 = childSnapshot_2.val().pointsPerGameWeek;
                        for(var z = 0; z < gameWeek-1; z++){
                            currentArray.push(pointsId_2[z])
                        }
                        arrayOfArrays.push(currentArray);
                    });

                    var sums = arrayOfArrays.reduce(function(r, e, i) {
                        e.forEach((a, j) => r[j] = (r[j] || 0) + a)
                        if (i == arrayOfArrays.length - 1) r = r.map(el => el / arrayOfArrays.length);
                        return r;
                    }, [])



                    var ctx = document.getElementById("canvas").getContext("2d");
                    var myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: gameWeeks,
                            datasets: [
                                {
                                    label: "Week Points (Own)",
                                    fill: false,
                                    lineTension: 0.1,
                                    backgroundColor: "rgba(75,192,192,0.4)",
                                    borderColor: "rgba(75,192,192,1)",
                                    borderCapStyle: 'butt',
                                    borderDash: [],
                                    borderDashOffset: 0.0,
                                    borderJoinStyle: 'miter',
                                    pointBorderColor: "rgba(75,192,192,1)",
                                    pointBackgroundColor: "#fff",
                                    pointBorderWidth: 1,
                                    pointHoverRadius: 5,
                                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                                    pointHoverBorderColor: "rgba(220,220,220,1)",
                                    pointHoverBorderWidth: 2,
                                    pointRadius: 1,
                                    pointHitRadius: 10,
                                    data: weeklyPointsArray,
                                    spanGaps: false
                                },
                                {
                                    label: "Week Points (League Average)",
                                    fill: false,
                                    lineTension: 0.1,
                                    backgroundColor: "#ff6450",
                                    borderColor: "#ff6450",
                                    borderCapStyle: 'butt',
                                    borderDash: [],
                                    borderDashOffset: 0.0,
                                    borderJoinStyle: 'miter',
                                    pointBorderColor: "#ff6450",
                                    pointBackgroundColor: "#fff",
                                    pointBorderWidth: 1,
                                    pointHoverRadius: 5,
                                    pointHoverBackgroundColor: "#ff6450",
                                    pointHoverBorderColor: "rgba(220,220,220,1)",
                                    pointHoverBorderWidth: 2,
                                    pointRadius: 1,
                                    pointHitRadius: 10,
                                    data: sums,
                                    spanGaps: false
                                }
                            ]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero:true
                                    }
                                }]
                            },
                            responsive: true
                        }
                    });

                });

            });
        });

    };

    // START THE PROGRAM BY CHECKING IF THERE IS A USER ALREADY LOGGED IN
    // THIS LISTENER WILL CALL A FUNCTION EVERY TIME A USER LOGS IN OR OUT (OR WHEN JUST OPENED THE PAGE)

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) { /// THERE IS A USER LOGGED IN
            $("#loader").removeClass("hidden");
            callInfoAPI();
            $("#top-navbar").removeClass("hidden");
            $("#wrapper").addClass("hide");
            $("body").css('background-image', 'none');
            $('#registrationBtn').css('display','none');
            $("#registrationBtn").addClass("hide");
            $("#weekly_picks").empty();
            for(var week = 0; week < 38; week++){
                var week_div = $("<div>");
                week_div.addClass("item weekly_pick");
                week_div.attr("value",week);
                week_div.text("Gameweek " + (week + 1));
                $("#weekly_picks").append(week_div);
            }

            var currentUser = firebase.auth().currentUser;
            game.currentUserUid = currentUser.uid;

            usersRef.orderByKey().equalTo(game.currentUserUid).once("value", function (snapshot) {

                snapshot.forEach(function (childSnapshot) {

                    var keyId = childSnapshot.val();
                    game.thisWeekPick = keyId.picksPerGameWeek;
                    game.email = keyId.email;
                    game.name = keyId.name;
                    game.teamName = keyId.teamName;

                    $("#welcome").text("Hello " + keyId.name + "!!");
                    $("#team-name h1").html(keyId.teamName.toUpperCase());

                });

                $("#homepage").css("display", "none");
                $("#logInPage").css("display", "none");
                $("#profilePage").css("display", "block");
                $("#rankingsTable").css("display","block");
                $("#lastWeekInfo").css("display","block");
                $("#team-name").removeClass("hidden");
                selectedTeams = [];

                if(game.new_user === true){

                    var picksArray = [];
                    var picksPerGameWeek = [];

                    for (var z = 0; z < 10; z++) {
                        picksPerGameWeek.push("DRAW");
                    }

                    for (var p = 0; p < 38; p++) {

                        picksArray.push(picksPerGameWeek);

                    }

                    var pointsArray = [];
                    for (var a = 0; a < 38; a++) {
                        pointsArray.push(parseInt(0));
                    }
                    var monthlyPointsArray = [];
                    for (var b = 0; b < 10; b++) {
                        monthlyPointsArray.push(parseInt(0))
                    }
                    var gamesPlayedArray = pointsArray;

                    var createUserObject = {

                        email: game.email,
                        name: game.name,
                        teamName: game.teamName,
                        currentUserUid: game.currentUserUid,
                        picksArray: picksArray, //// picksArray = [[undefined,undefined,...,undefined],[undefined,undefined,...,undefined], etc]
                        pointsArray: pointsArray, //// pointsArray = [0,0,0,0,...,0] 38 gameweeks, so 38 weekly points
                        gamesPlayedArray: gamesPlayedArray, //// TO COUNT HOW MANY GAMES A USER HAS PLAYED
                        monthlyPoints: monthlyPointsArray, //// 0 = August, 1 = , September, etc...
                        totalPoints: 0,
                        totalGamesPlayed: 0

                    };

                    $.post("/createUser", createUserObject, function (data) {

                        game.new_user = false;
                        location.reload();

                    });


                }else{
                    makePicksTable();
                }


            });
        } else {
            $("#top-navbar").addClass("hidden");
            $("#team-name").addClass("hidden");
            $("#wrapper").removeClass("hide");
            //showSignUpBox();
            $("#profilePage").css("display", "none");
            //updateDatabase();
            $("#welcome").html("Welcome");
            if (!($("#clubs").hasClass("hidden"))) {
                $("#clubs").addClass("hidden");
            }
            $("#registrationBtn").removeClass("hide");
            $("body").css('background', 'url("images/bg-img.jpg") fixed');
            $("body").css('background-size', 'cover');


        }
    });


// WHAT HAPPENS WHEN A USER LOGS OUT
    $(document).on("click", "#signout-btn", function (event) {
        event.preventDefault();

        firebase.auth().signOut().then(function () {
            usersRef.off("value");
            game.email = "";
            game.name = "";
            game.teamName = "";
            game.currentUserUid = "";
            lastWeeksPicks = "";
            game.lastWeeksResults = "";
            weeklyPoints = 0;
            $(".rankingsDiv").css("display", "none");
            $("#lastWeekInfo").css("display","none");
            $('#registrationBtn').css('display','block');
            // Sign-out successful.
        }).catch(function (error) {
            console.log(error.code);// An error happened.
            console.log(error.message);// An error happened.
        });
    });

    /// PICKS ARE SENT TO FIREBASE AS AN ARRAY OR WE ALERT THE USER IF THERE ARE NO PICKS SELECTED
    /// ALSO TAKE CARE OF UPDATING THE CURRENT AND LAST WEEK PICKS MODALS ACCORDINGLY
    $("#submitPicks").on("click", function (event) {
        event.preventDefault();

        incompleteSelection = false;
        for (var r = 0; r < (selectedTeams.length); r++) {
            var value = ($("#picksContainer .radio-group .selected[name='" + r + "']").attr("value"));
            selectedTeams[r] = value;
            //  selectedTeams[r] = ($("input[name='" + r + "']:checked").val());
            if (selectedTeams[r] === undefined) {

                $("#picks-submitted-unsuccessfully").iziModal({
                    title: "Please make a selection for every game",
                    icon: 'icon-star',
                    headerColor: '#b83c3c ',
                    width: 600,
                    timeout: 15000,
                    timeoutProgressbar: true,
                    transitionIn: 'fadeInUp',
                    transitionOut: 'fadeOutDown',
                    history: false,
                    autoOpen: true/*,
                     onClosed: function(){
                     $("html").removeClass('overflow-hidden');
                     }*/
                });

                //alert("undefined bruh");
                incompleteSelection = true;
                break;
            }
        }

        if (incompleteSelection === false) {
            $("#picks-submitted-successfully").iziModal({
                title: "Your Picks Have Been Successfully Submitted",
                icon: 'icon-star',
                headerColor: '#5cb85c ',
                width: 600,
                timeout: 15000,
                timeoutProgressbar: true,
                transitionIn: 'fadeInUp',
                transitionOut: 'fadeOutDown',
                /*attached: 'bottom',*/
                history: false,
                autoOpen: true/*,
                 onClosed: function(){
                 $("html").removeClass('overflow-hidden');
                 }*/
            });
        }


        var databaseGameWeek = (gameWeek-1).toString();

        var submitInfo = {

            databaseGameWeek: databaseGameWeek,
            selectedTeams:selectedTeams,
            currentUserUid:game.currentUserUid

        };

        $.post("/submitPicks", submitInfo, function (data) {
            console.log("picks submitted!");

        });

    });


    ////////////////// IZIMODAL ///////////////////////

    $("#modal-custom").iziModal({
        overlayClose: false,
        width: 600,
        autoOpen: false,
        overlayColor: 'rgba(0, 0, 0, 0.6)'
    });

    $("#modal-custom section:not(.hide)").keypress(function(e) {
        if (e.which === 13) {
            $("#modal-custom section:not(.hide) button.submit").click();
        }
    });

    /* JS inside the modal */
    $("#modal-custom").on('click', 'header a', function(event) {
        event.preventDefault();
        var index = $(this).index();
        $(this).addClass('active').siblings('a').removeClass('active');
        $(this).parents("div").find("section").eq(index).removeClass('hide').siblings('section').addClass('hide');

        if( $(this).index() === 0 ){
            $("#modal-custom .iziModal-content .icon-close").css('background', '#ddd');
        } else {
            $("#modal-custom .iziModal-content .icon-close").attr('style', '');
        }
    });

    $("#modal-custom").on('click', "#signUp", function(event) {
        event.preventDefault();

        // STORE INPUT VALUES INTO VARIABLES SO WE CAN USE LATER
        game.email = $("#emailRegistration").val();
        game.name = $("#name").val();
        game.teamName = $("#teamName").val();

        var that = $(this);



        /// adding some requirements to register

        if(game.name.length > 2 && game.teamName.length > 2) {
            /// LOGIC AFTER A SUCCESSFUL REGISTRATION
            firebase.auth().createUserWithEmailAndPassword(game.email, $("#passwordRegistration").val()).then(function () {
                // CREATE A NODE IN OUR DATABASE WITH THIS USER'S INFORMATION
                // EACH NODE'S KEY WILL BE THEIR REGISTRATION KEY.
                // THIS ALLOWS US TO NOT HAVE TO LOOP THROUGH THE OBJECTS, WE JUST DO A SIMPLE QUERY
                // FOR THE USER'S NUMBER
                $('#modal-custom').iziModal('toggle');
                var currentUser = firebase.auth().currentUser;
                game.currentUserUid = currentUser.uid;
                game.new_user = true

            }).catch(function (error) {

                if (error) {
                    var fx = "wobble",  //wobble shake
                        $modal = that.closest('.iziModal');

                    if (!$modal.hasClass(fx)) {
                        $modal.addClass(fx);
                        setTimeout(function () {
                            $modal.removeClass(fx);
                        }, 1500);
                    }
                }

                $("#email").val("");
                $("#pwd").val("");
                $("#name").val("");
                $("#teamName").val("");
            });
        }else{
            var fx = "wobble",  //wobble shake
                $modal = that.closest('.iziModal');

            if (!$modal.hasClass(fx)) {
                $modal.addClass(fx);
                setTimeout(function () {
                    $modal.removeClass(fx);
                }, 1500);
            }
        }
    });

// WHAT HAPPENS WHEN THE USER LOGS IN
    $("#modal-custom").on('click', "#logIn", function(event) {
        event.preventDefault();

        var that = $(this);

        firebase.auth().signInWithEmailAndPassword($("#emailLogIn").val(), $("#passwordLogIn").val()).then(function () {
            $('#modal-custom').iziModal('close', {
                transition: 'bounceOutDown' // Here transitionOut is the same property.
            });

        }).catch(function (error) {
            // Handle Errors here.
            if(error) {
                var fx = "wobble",  //wobble shake
                    $modal = that.closest('.iziModal');

                if (!$modal.hasClass(fx)) {
                    $modal.addClass(fx);
                    setTimeout(function () {
                        $modal.removeClass(fx);
                    }, 1500);
                }
            }

        });
    });

    /// RESET PASSWORD LOGIC
    $("#resetPassword").on('click', function(event) {

        event.preventDefault();


        var emailForPasswordReset = $("#emailForPasswordReset").val();
        var that = $(this);

        firebase.auth().sendPasswordResetEmail(emailForPasswordReset).then(function () {
            // Email sent.
        }, function (error) {
            if (error) {
                var fx = "wobble",  //wobble shake
                    $modal = that.closest('.iziModal');

                if (!$modal.hasClass(fx)) {
                    $modal.addClass(fx);
                    setTimeout(function () {
                        $modal.removeClass(fx);
                    }, 1500);
                }
            }
        });
    });

    //// CLICKING ON A WEEKLY PICK OPTION

    $(document).on("click", ".weekly_pick", function(event){

        var value = parseInt($(this).attr("value"));
        $("#weekly_title").html("Gameweek " + (value+1) + " results");

        $('#game-results').empty();
        $("#yourPicks").empty();



        usersRef.orderByKey().equalTo(game.currentUserUid).once("value", function (snapshot) {


            snapshot.forEach(function (childSnapshot) {



                for (var l = 0; l < childSnapshot.val().picksPerGameWeek[value].length; l++) {

                    var row_pick = $("<tr>");
                    var picks = $("<td>");

                    picks.html(childSnapshot.val().picksPerGameWeek[value][l]);

                    row_pick.append(picks);
                    $("#yourPicks").append(row_pick);

                }

                /// NEW STUFF

                let compare = function (a,b) {
                    if (a._links.self.href < b._links.self.href)
                        return -1;
                    if (a._links.self.href > b._links.self.href)
                        return 1;
                    return 0;
                };

                // THIS ARRAY HOLDS THE RESULTS FOR GAMES LAST WEEK. WE GET THE GAMES CORRESPONDING TO THE GAMEWEEK, THEN WE SORT THEM.

                let sortedArrayWeeklyPoints = [];

                for (let e = 0; e < game.fixtures.length; e++) {
                    if ((game.fixtures[e].matchday === (value + 1))) {
                        sortedArrayWeeklyPoints.push(game.fixtures[e])
                    }
                }

                sortedArrayWeeklyPoints.sort(compare);

                //for (var e = 0; e < game.fixtures.length; e++) {
                for (let e = 0; e < sortedArrayWeeklyPoints.length; e++) {
                    //if ((game.fixtures[e].matchday === (value+1))) {

                        var row = $("<tr>");
                        var col = $("<td>");
                        var game_titles = $("<th>");

                        var resultHomeDiv = $('<div class="result-cell">');
                        // var homeTeam = $('<span>' + game.fixtures[e].homeTeamName + '</span><span class="right floated"> ' + game.fixtures[e].result.goalsHomeTeam + '</span>');
                        var homeTeam = $('<span>' + sortedArrayWeeklyPoints[e].homeTeamName + '</span><span class="right floated"> ' + sortedArrayWeeklyPoints[e].result.goalsHomeTeam + '</span>');
                        var resultAwayDiv = $('<div class="result-cell">');
                        // var awayTeam = $('<span>' + game.fixtures[e].awayTeamName + '</span><span class="right floated"> ' + game.fixtures[e].result.goalsAwayTeam + '</span>');
                        var awayTeam = $('<span>' + sortedArrayWeeklyPoints[e].awayTeamName + '</span><span class="right floated"> ' + sortedArrayWeeklyPoints[e].result.goalsAwayTeam + '</span>');

                        //game_titles.append(game.fixtures[e].homeTeamName + " vs " + game.fixtures[e].awayTeamName);
                        game_titles.append(sortedArrayWeeklyPoints[e].homeTeamName + " vs " + sortedArrayWeeklyPoints[e].awayTeamName);
                        resultHomeDiv.append(homeTeam);
                        resultAwayDiv.append(awayTeam);
                        col.append(resultHomeDiv);
                        col.append(resultAwayDiv);
                        row.append(col);
                        $('#game-results').append(row);
                        $("#everyone-titles").append(game_titles);
                    //}
                }



                $('#weekly-picks-modal').iziModal('open', this); // Do not forget the "this"

            });

        });

    });

    /// CHAT LOGIC


    $(document).on("click","#send",function(event) {
        event.preventDefault();

        var message = $("#chatInput").val();


        $("#chatInput").val("");



        var messageInfo = {
            message: message,
            name: game.name,
            date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
        }

        $.post("/sendMessage", messageInfo, function (data) {
            console.log("message sent!");

        });

    });


    chatRef.orderByKey().on("child_added",function(snapshot) {

        var sender = $("<p style='color: #2196f3; margin-top: 10px'>").html(snapshot.val().name + ":");
        if(snapshot.val().name === game.name){
            sender = $("<p style='color: #1fa13b'>").html(snapshot.val().name + ":");
        }
        //var newMessage = $("<p>").html(snapshot.val().message);
        var newMessage = snapshot.val().message;

        newMessage = newMessage.replace(/\r?\n/g, '<br />');

        $("#chat-content").append(sender);
        $("#chat-content").append(newMessage);

        $("#chat-content").scrollTop($("#chat-content")[0].scrollHeight);
    });

    ////////// DEALING WITH THE RESPONSE TO CLICKING ON BUTTONS THAT PRODUCE MODALS ///////////

    $("#pointsGraph").on("click",function(){
        if(gameWeek !== 1) {

            makeWeeklyPointsGraph();
            $('#modal-modifications').iziModal('open');
        }
    });

    // $("#lastWeeksResultsBtn").on('click', function () {
    //
    //     $('#lastWeek-modal').iziModal('open', this); // Do not forget the "this"
    // });

    $("#everyoneBtn").on('click', function () {

        window.open('/all_current_picks', '_blank');

    });

    $("#chatBtn").on('click', function () {

        $('#chat-modal').iziModal('open', this); // Do not forget the "this"

        $("#chat-content").scrollTop($("#chat-content")[0].scrollHeight);


    });

    $("#instructions").on('click', function () {

        window.open('/instructions_and_contact', '_blank');

    });

    $("#rankingsBtn").on('click', function () {
        $("#rankings").empty();
        makeRankingsTable();
        $('table').tablesort();
        $('#rankings-modal').iziModal('open', this); // Do not forget the "this"
    });


    $("#modal-modifications").iziModal({
        title:'Points Per Week',
        overlayClose: true,
        autoOpen: false,
        overlayColor: 'rgba(0, 0, 0, 0.6)'
    });

    $("#rankings-modal").iziModal({
        title: 'Rankings',
        subtitle: 'As of gameweek: ' + (gameWeek),
        theme: '',
        headerColor: '#1fa13b',
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        iconColor: '',
        iconClass: null,
        width: 1000,
        padding: 0,
        overlayClose: true,
        closeOnEscape: true,
        bodyOverflow: false,
        autoOpen: false
    });

    $("#chat-modal").iziModal({
        title: "Message Board",
        //subtitle: "Gam",
        theme: '',
        headerColor: '#1fa13b',
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        iconColor: '',
        iconClass: null,
        width: 600,
        padding: 0,
        overlayClose: true,
        closeOnEscape: true,
        bodyOverflow: false,
        autoOpen: false
    });

    $("#weekly-picks-modal").iziModal({
        title: "Weekly results and picks",
        subtitle: "",
        theme: '',
        headerColor: '#1fa13b',
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        iconColor: '',
        iconClass: null,
        width: 600,
        padding: 0,
        overlayClose: true,
        closeOnEscape: true,
        bodyOverflow: false,
        autoOpen: false
    });


////////////////////////////////////////////////////////
// NEWS TOOL
////////////////////////////////////////////////////////
    var NEWS_API_KEY = "b8e5013c-f10c-474c-9cf6-b9416ae989ef";
    var getTeamNewsQueryURL = "https://content.guardianapis.com/search?section=football&page-size=50&api-key=";
    var API_KEY = "43d2319104c54b0c9cf2d5679ab2ae5d";
    var getTeamsQueryURL = "https://api.football-data.org/v1/competitions/445/leagueTable?matchday=38";
    var teams = [];
    var eplData = [];
    var standing = [];
    var newsArray = [];
    var badges = [
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t3.svg", // Arsenal
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t91.svg", // Bournemouth
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t36.svg", // Brighton
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t90.svg", // Burnley
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t8.svg", // Chelsea
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t31.svg", // Crystal Palace
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t11.svg", // Everton
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t38.svg", // Huddersfield Town
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t13.svg", // Leicester
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t14.svg", // Liverpool
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t43.svg", // Man City
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t1.svg", // Man United
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t4.svg", // Newcastle United
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t20.svg", // Southampton
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t110.svg", // Stoke City
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t80.svg", // Swansea
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t6.svg", // Tottenham
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t57.svg", // Watford
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t35.svg", // West Brom
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t21.svg" // West Ham
    ];



    /**
     * Make football-data API call, and once done, get jokecamp JSON. Put all
     * necessary data in variables and create DOM elements
     */
    function callInfoAPI() {
        $.ajax({
            headers: {'X-Auth-Token': API_KEY},
            url: getTeamsQueryURL,
            dataType: 'json',
            type: 'GET'
        }).done(function (response) {
            standing = response.standing;

            $.ajax({
                url: getTeamNewsQueryURL + NEWS_API_KEY,
                method: "GET"
            }).done(function (response) {
                newsArray = response.response.results;

                $.ajax({
                    url: "https://jokecamp.github.io/epl-fantasy-geek/js/static-data.json",
                    method: "GET"
                }).done(function (response) {
                    teams = response.teams;
                    eplData = response.elements;

                    $.each(teams, function (index, team) {
                        teams[index].crestUrl = badges[index];

                        // rename team names in teams array to match
                        // team names from football-data api response.
                        // TOT, MANU, and MANCity are special cases
                        if (teams[index].name === "Spurs") {
                            teams[index].name = "Tottenham Hotspur FC";
                        } else if (teams[index].name === "Man Utd") {
                            teams[index].name = "Manchester United FC";
                        } else if (teams[index].name === "Man City") {
                            teams[index].name = "Manchester City FC";
                        } else {
                            $.each(standing, function (i, val) {
                                if (val.teamName.toLowerCase().includes(team.name.toLowerCase())) {
                                    teams[index].name = val.teamName;
                                    return false;
                                }
                            });
                        }
                    });

                    setTeamsTag();

                    createTeamsNav();
                });
            });
        });
    }

    /**
     * Creates the teams navbar and each team's on click event handler
     */
    function createTeamsNav() {
        var mainDiv = $("#clubs");
        $("#club-navbar").empty();
        if ($("#clubs").hasClass("hidden")) {
            $("#clubs").removeClass("hidden");
        }

        $.each(teams, function(index, team) {
            var teamBadge = $('<div class="item" id=' + team.short_name + '><img class="badge-icon" src="' + team.crestUrl + '"></div>');

            $("#club-navbar").append(teamBadge);
            if (team.short_name === "ARS") {
                teamBadge.addClass("active");
            }

            teamBadge.on("click", function() {
                $('.ui .item').removeClass('active');
                $(this).addClass('active');
                var teamId = $(this).attr("id");

                createTeamsPage(teamId);
            });
        });

        $("#club-navbar").appendTo("#nav-container");

        createTeamsPage("ARS");
    }

    /**
     * Creates club's info section
     */
    function createTeamsPage(teamId) {
        var teamCode = getTeamCode(teamId);
        // get team function
        var contentContainer = $("#content-container");

        // INJURIES BOX
        $("#injuries-content").empty();
        var playerName = undefined;
        $.each(eplData, function(index, player) {
            if (player.team_code === teamCode) {
                if (player.status === "i" || player.status === "d" || player.status === "s") {
                    playerName = $('<h2 class="ui sub header">' + player.first_name + ' ' + player.second_name + '</h4>');
                    $("#injuries-content").append(playerName);

                    var injuryInfo = $('<div>' + player.news + '</div>');
                    $("#injuries-content").append(injuryInfo);
                }
            }
        });

        if (playerName === undefined) {
            playerName = $('<h4 class="ui sub header">No Injuries</h4>');
            $("#injuries-content").append(playerName);
        }

        // GENERAL INFORMATION BOX
        $("#team-info-content").empty();
        // TOP SCORER

        var topScorerData = getTopScorer(teamId);
        var topScorerLabel = $('<h2 class="ui sub header">Top Scorer(s)</h2>');
        $("#team-info-content").append(topScorerLabel);
        for (var i = 0; i < topScorerData[0].length; i++) {
            var topScorer = $('<div>' + topScorerData[0][i] + ': ' + topScorerData[1] + ' goals</div>');
            $("#team-info-content").append(topScorer);
        }

        // CLEAN SHEETS
        var cleanSheetsData = getCleanSheets(teamId);
        var cleanSheetsLabel = $('<h2 class="ui sub header">Clean Sheets: ' + cleanSheetsData + '</h2>');
        $("#team-info-content").append(cleanSheetsLabel);

        // HOME RECORD
        var homeRecordLabel = $('<h2 class="ui sub header">Home Record</h2>');
        $("#team-info-content").append(homeRecordLabel);
        $.each(standing, function(index, team) {
            if (team.teamName.toLowerCase().includes(getTeamName(teamId).toLowerCase())) {
                var homeWins = $('<div>Wins: ' + team.home.wins + '</div>');
                $("#team-info-content").append(homeWins);
                var homeLosses = $('<div>Losses: ' + team.home.losses + '</div>');
                $("#team-info-content").append(homeLosses);
                var homeDraws = $('<div>Draws: ' + team.home.draws + '</div>');
                $("#team-info-content").append(homeDraws);
                var homeGoalsScored = $('<div>Goals Scored: ' + team.home.goals + '</div>');
                $("#team-info-content").append(homeGoalsScored);
                var homeGoalsAgainst = $('<div>Goals Against: ' + team.home.goalsAgainst + '</div>');
                $("#team-info-content").append(homeGoalsAgainst);
            }
        });

        // AWAY RECORD
        var awayRecordLabel = $('<h2 class="ui sub header">Away Record</h2>');
        $("#team-info-content").append(awayRecordLabel);
        $.each(standing, function(index, team) {
            if (team.teamName.toLowerCase().includes(getTeamName(teamId).toLowerCase())) {
                var awayWins = $('<div>Wins: ' + team.away.wins + '</div>');
                $("#team-info-content").append(awayWins);
                var awayLosses = $('<div>Losses: ' + team.away.losses + '</div>');
                $("#team-info-content").append(awayLosses);
                var awayDraws = $('<div>Draws: ' + team.away.draws + '</div>');
                $("#team-info-content").append(awayDraws);
                var awayGoalsScored = $('<div>Goals Scored: ' + team.away.goals + '</div>');
                $("#team-info-content").append(awayGoalsScored);
                var awayGoalsAgainst = $('<div>Goals Against: ' + team.away.goalsAgainst + '</div>');
                $("#team-info-content").append(awayGoalsAgainst);
            }
        });

        // STANDINGS
        $("#table-standings-content").empty();
        $.each(standing, function(index, team) {
            var tr = $('<tr>');
            if (team.teamName.toLowerCase().includes(getTeamName(teamId).toLowerCase())) {
                tr.addClass("negative");
            }
            var td = $('<td>' + team.position + '</td><td class="mobile-table">' +
                team.teamName + '</td><td class="desktop-table">' +
                getTeamId(team.teamName) + '</td><td class="mobile-table">' +
                team.playedGames + '</td><td>' +
                team.wins + '</td><td>' +
                team.draws + '</td><td>' +
                team.losses + '</td><td>' +
                team.goals + '</td><td>' +
                team.goalsAgainst + '</td><td class="mobile-table">' +
                team.goalDifference + '</td><td>' +
                team.points + '</td>');

            td.appendTo(tr);
            $("#table-standings-content").append(tr);
        });

        // NEWS
        $("#team-news-content").empty();
        var articleLabel = undefined;

        $.each(newsArray, function(index, newsArticle) {
            var tags = getTeamTags(teamId);

            $.each(tags, function(i, tag) {
                if (newsArticle.webTitle.toLowerCase().includes(tag.toLowerCase()) ||
                    newsArticle.webUrl.toLowerCase().includes(tag.toLowerCase())) {
                    articleLabel = $('<h2 class="ui sub header">' + newsArticle.webTitle + '</h2>');
                    $("#team-news-content").append(articleLabel);
                    var readMore = $('<div><a href=' + newsArticle.webUrl + ' target="_blank">Read More...</a></div>');
                    $("#team-news-content").append(readMore);
                    return false;
                }
            });
        });

        if (articleLabel === undefined) {
            articleLabel = $('<h2 class="ui sub header">No News</h2>');
            $("#team-news-content").append(articleLabel);
        }

    }

    /**
     * Helper function that gets team three letter code given API team ID
     */
    function getTeamCode(teamId) {
        var teamCode;
        $.each(teams, function(index, team) {
            if (team.short_name === teamId) {
                teamCode = team.code;
                return false;
            }
        });

        return teamCode;
    }

    /**
     * Helper function that gets team name given API team ID
     */
    function getTeamName(teamId) {
        var teamName;
        $.each(teams, function(index, team) {
            if (team.short_name === teamId) {
                teamName = team.name;
                return false;
            }
        });

        return teamName;
    }

    function getTeamId(teamName) {
        var teamId;
        $.each(teams, function(index, team) {
            if (team.name === teamName) {
                teamId = team.short_name;
                return false;
            }
        });

        return teamId;
    }

    /**
     * Get team's top goal scorer
     */
    function getTopScorer(teamId) {
        var teamCode = getTeamCode(teamId);
        var topScorer = [[], -1];
        $.each(eplData, function(index, player) {
            if (player.team_code === teamCode) {
                if (player.goals_scored > topScorer[1]) {
                    topScorer[0] = [];
                    topScorer[0].push(player.first_name + " " + player.second_name);
                    topScorer[1] = player.goals_scored;
                } else if (player.goals_scored === topScorer[1]) {
                    topScorer[0].push(player.first_name + " " + player.second_name);
                }
            }
        });

        return topScorer;
    }

    /**
     * Get team's clean sheets
     */
    function getCleanSheets(teamId) {
        var teamCode = getTeamCode(teamId);
        var cleanSheets = 0;
        $.each(eplData, function(index, player) {
            if (player.team_code === teamCode && player.element_type === 1) {
                cleanSheets += player.clean_sheets;
            }
        });

        return cleanSheets;
    }

    /**
     * This helper function assigns tags to each club so it will be easier to
     * identify news about each team
     */
    function setTeamsTag() {
        $.each(teams, function(index, team) {
            if (team.short_name === "ARS") {
                team.tag = ["Arsenal", "Gunners"];
            } else if (team.short_name === "BOU") {
                team.tag = ["Bournemouth", "Cherries"];
            } else if (team.short_name === "BUR") {
                team.tag = ["Burnley", "Clarets"];
            } else if (team.short_name === "CHE") {
                team.tag = ["Chelsea", "Blues"];
            } else if (team.short_name === "CRY") {
                team.tag = ["Palace", "Eagles"];
            } else if (team.short_name === "EVE") {
                team.tag = ["Everton", "Toffees"];
            } else if (team.short_name === "HUD") {
                team.tag = ["Huddersfield", "Huddersfield Town", "Terriers"];
            } else if (team.short_name === "LEI") {
                team.tag = ["Leicester", "Foxes"];
            } else if (team.short_name === "LIV") {
                team.tag = ["Liverpool", "Reds"];
            } else if (team.short_name === "MCI") {
                team.tag = ["Manchester City", "Citizens"];
            } else if (team.short_name === "MUN") {
                team.tag = ["Manchester United", "United", "Red Devils"];
            } else if (team.short_name === "NEW") {
                team.tag = ["Newcastle", "Magpies"];
            } else if (team.short_name === "SOU") {
                team.tag = ["Southampton", "Saints"];
            } else if (team.short_name === "STK") {
                team.tag = ["Stoke", "Potters"];
            } else if (team.short_name === "BHA") {
                team.tag = ["Brighton", "Seagulls"];
            } else if (team.short_name === "SWA") {
                team.tag = ["Swansea", "Swans"];
            } else if (team.short_name === "TOT") {
                team.tag = ["Tottenham", "Spurs"];
            } else if (team.short_name === "WAT") {
                team.tag = ["Watford", "Hornets"];
            } else if (team.short_name === "WBA") {
                team.tag = ["West Bromwich", "West Brom", "Albion", "Baggies"];
            } else if (team.short_name === "WHU") {
                team.tag = ["West Ham", "Hammers", "Irons"];
            }
        });
    }


    /**
     * Helper function to get team's tags given the teamId
     */
    function getTeamTags(teamId) {
        var tags;
        $.each(teams, function(index, team) {
            if (team.short_name === teamId) {
                tags = team.tag;
                return false;
            }
        });

        return tags;
    }

});

