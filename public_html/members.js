let currentUser = "rsd477";
let profileUsername;
let friends = [];

window.onorientationchange = function() { 
    var orientation = window.orientation; 
        switch(orientation) { 
            case 0:
            case 90:
            case -90: window.location.reload();
            break;
        } 
};

$(document).ready(function() {
    let height = screen.height * .89;
    let width = screen.width;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm  + '-' + dd;

    loadUsers();

    $("#map").html(`
    <div class="head" id="locationsHead" data-role="header">
        <a class="back" href="#home"><img src="themes/images/icons-png/carat-l-black.png"></a>
        <span>Covid Map</span>
    </div>
    <iframe width="${width}" height="${height}" id="covidMap" src="https://app.developer.here.com/coronavirus/" frameborder="0"></iframe>
    `);
    
    let frndFndrHidden = true;
    $("#myfriendFinder, #myfriendFinder *").hide();
    $("#myfriendSearchBtn").click((e)=>{
        if(frndFndrHidden){
            $("#fL").hide();
            $("#myFriendsBack, #myFriendsBack *").hide();
            $("#myfriendFinder, #myfriendFinder *").show();
            $("#myfriendSearchBtn").html(`<img src="themes/images/icons-png/delete-black.png">`);
            frndFndrHidden = false;
        } else {
            $("#fL").show();
            $("#myfriendFinder, #myfriendFinder *").hide();
            $("#myFriendsBack, #myFriendsBack *").show();
            $("#myfriendSearchBtn").html(`<img src="themes/images/icons-png/search-black.png">`);
            frndFndrHidden = true;

        }

    });

    $("#q3").html(
       `<h2>When was this test?</h2>
          <input type="date"
                 id="lastTest" 
                 data-clear-btn="true"
                 min="2020-03-01" 
                 max="${today}"
                 /><br></br>`
    );

    $("#q2, #q2 *").hide();
    $("#q3, #q3 *").hide();

    let pressed = [];
    $("#report a").click((e)=>{
        let value = e.target.closest("a").getAttribute("value");
        if(!(value === "symSubmit")){
            if(pressed.includes(value)){
                pressed = pressed.filter(a => a !== value);
                $(`a[value="${value}"]`).css("background-color","#f6f6f6");
            } else{
                if(value === "none"){
                    for(let i=0; i<pressed.length; i++){
                        $(`a[value="${pressed[i]}"]`).css("background-color","#f6f6f6");
                    }
                    pressed = ["none"];
                } else {
                    if(pressed.includes("none")){
                        pressed = [];
                        $(`a[value="none"]`).css("background-color","#f6f6f6");
                    }
                    pressed.push(value);
                }
                $(`a[value="${value}"]`).css("background-color","lightblue");
            }
        } else {
            if(pressed.length < 1){
                alert("SELECT A SYMPTOM!");
            }else{
                $("#q2, #q2 *").hide();
                $("#q3, #q3 *").hide();
                $( ":mobile-pagecontainer" ).pagecontainer( "change", "#report-test" );
            }
        }

    });

    let q1=false;
    $('#q1 #checkbox1').change(function() { 
        if (this.checked) {
            if($('#q1 #checkbox2').prop("checked")){
                $('#q1 #checkbox2').prop( "checked", false ).checkboxradio("refresh");
            }
            q1=true;
        } else {
            if(!$('#q1 #checkbox2').prop("checked")){
                $('#q1 #checkbox2').prop( "checked", true ).checkboxradio("refresh");
            }
            q1=false;
        }
        interpret();
    });

    $('#q1 #checkbox2').change(function() { 
        if (this.checked) {
            if($('#q1 #checkbox1').prop("checked")){
                $('#q1 #checkbox1').prop( "checked", false ).checkboxradio("refresh");
            }
            q1=false;
        } else {
            if(!$('#q1 #checkbox1').prop("checked")){
                $('#q1 #checkbox1').prop( "checked", true ).checkboxradio("refresh");
            }
            q1=true;
        }
        interpret();
    });

    let q2=false;
    let q2change = false;
    $('#q2 #checkbox3').change(function() {
        if (this.checked) {
            if($('#q2 #checkbox4').prop("checked")){
                $('#q2 #checkbox4').prop( "checked", false ).checkboxradio("refresh");
            }
            q2=true;
        } else {
            if(!$('#q2 #checkbox4').prop("checked")){
                $('#q2 #checkbox4').prop( "checked", true ).checkboxradio("refresh");
            }
            q2=false;
        }
        q2change = true;
        interpret();
    });

    $('#q2 #checkbox4').change(function() {
        if (this.checked) {
            if($('#q2 #checkbox3').prop("checked")){
                $('#q2 #checkbox3').prop( "checked", false ).checkboxradio("refresh");
            }
            q2=false;
        } else {
            if(!$('#q2 #checkbox3').prop("checked")){
                $('#q2 #checkbox3').prop( "checked", true ) 
            }
            q2=true;
        }
        q2change = true;
        interpret();
    });

    let validDate = false;
    $('#lastTest').change(function(){
        var dt = new Date( $(this).val());
        var year = dt.getFullYear();
        var month =  (dt.getMonth() < 10 ? '0' : '') + (dt.getMonth()+1);
        var day = (dt.getDate() < 10 ? '0' : '') + dt.getDate();
        validDate = true;
        interpret();
    });    

    let readyToSubmit = false;
    function interpret(){
        if(q1){
            $("#q2, #q2 *").show();
            $("#q3, #q3 *").show();
            if(q2change && validDate){
                readyToSubmit = true;
            } else {
                readyToSubmit = false;
            }
        } else {
            $("#q2, #q2 *").hide();
            $("#q3, #q3 *").hide();
            readyToSubmit = true;
        }
    }

    $("#testSubmit").click((e)=>{
        if(readyToSubmit){
            alert("Thank you!");
            if(q1){
                if(q2){
                    // Deal with a positive result
                    fetch('/changeHealth', {
                        method: 'put',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: currentUser,
                            sick: true
                        })
                    })
                } else {
                    // Deal with a negative result
                    fetch('/changeHealth', {
                        method: 'put',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: currentUser,
                            sick: false
                        })
                    })
                }
            }
            
            $(":mobile-pagecontainer").pagecontainer( "change", "#home" );
            window.location.reload();
        } else {
            alert("Missing information!");
        }
    });

    $("#profileEdit").click(()=>{
        $( "#profilePanel" ).panel( "open" );

    });

    $("#friendSearchBtn").click(()=>{
        $( "#searchPanel" ).panel( "open" );
    });
    
    $("#allUsersList, #mfriendsList").click((e)=>{
        let username = e.target.closest("a").getAttribute("value");
        profileUsername = username;
        fetch(`/loadProfile?user=${username}`)
        .then(function(res){
            if(res.status == 200)
                return res.json();
        })
        .then(function(res){
            $("#profTitle").text(res.first_name);
            $("#profile2_name").text(res.first_name + " " + res.last_name);
            $("#profile2_email").text(res.email);
            $("#profile2_location").text(res.location);
            $("#profile2_sick").text(( res.sick ? "Sick" : "Healthy"));
            $("#addFriendBtn").attr("value", username);
            if(friends.includes(profileUsername)){
                $("#addFriendBtn").hide();
            } else {
                $("#addFriendBtn").show();
            }
        }).catch((err)=>console.log(err));
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "#profilePage" );

    });

    $("#addFriendBtn").click(function(e){
        fetch('/addFriend', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser,
                friend: $("#addFriendBtn").attr("value")
            })
        })

        $("#addFriendBtn").hide();
        alert("Added!")
    });

    $("#resetPass").click(function(e){
        let pass1 = $("#settingsPage #pass1").val();
        let pass2 = $("#settingsPage #pass2").val();
        if(pass1 !== pass2){
            alert("Passwords not equal");
        }  else if ((pass1.length < 6)||(pass1.length > 24)){
            alert("length must be between 6-24 characters");
        } else {
            fetch('/changePassword', {
                method: 'put',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: currentUser,
                  pass1: pass1,
                  pass2: pass2
                })
            })
        }
    });

});

function loadUsers(){
    fetch('/searchAll')
    .then(function(res){
        if(res.status == 200)
            return res.json();
        })
    .then(function(res){
        for(i in res){
            let first = res[i].first_name;
            let last = res[i].last_name;
            let username = res[i].user_name;
            let sick = res[i].sick;
            let temp = 
            `<li class="ui-listview-item  ui-listview-item-button ui-listview-item-has-alternate ui-li-has-thumb ui-first-child">
                <a value='${username}' data-mini="true" class="ui-button ui-icon-carat-r ui-btn ui-btn-icon-right">
                    <img src="themes/images/icons-png/default-profile.png">
                    <h3>${first} ${last}</h3>
                    <p>${( sick ? "Sick" : "Healthy")}</p>
                </a>
            </li>`;
            $("#allUsersList").append(temp);
        }
    })
    .catch((err)=>console.log(err));


    fetch(`/loadProfile?user=${currentUser}`)
    .then(function(res){
        if(res.status == 200)
            return res.json();
    })
    .then(function(res){
        $("#profile_name").text(res.first_name + " " + res.last_name);
        $("#profile_email").text(res.email);
        $("#profile_location").text(res.location);
        $("#profile_sick").text(( res.sick ? "Sick" : "Healthy"));
    }).catch((err)=>console.log(err));


    
    fetch(`/loadFriends?user=${currentUser}`)
    .then(function(res){
        if(res.status == 200)
            return res.json();
    })
    .then(function(res){
        friends = res.friends;
        for(i in friends){
            fetch(`/loadProfile?user=${friends[i]}`)
            .then(function(res){
                if(res.status == 200)
                    return res.json();
            })
            .then(function(resp){
                let first = resp.first_name;
                let last = resp.last_name;
                let username = resp.user_name;
                let sick = resp.sick;
                let temp = 
                `<li class="ui-listview-item ui-listview-item-has-alternate ui-li-has-thumb ui-first-child">
                    <a value='${username}' class="ui-listview-item-button ui-button ui-icon-carat-r ui-btn ui-btn-icon-right">
                        <img src="themes/images/icons-png/default-profile.png">
                        <h3>${first} ${last}</h3>
                        <p>${( sick ? "Sick" : "Healthy")}</p>
                    </a>
                </li>`;
                $("#mfriendsList").append(temp);
            }).catch((err)=>console.log(err));
        }
    }).catch((err)=>console.log(err));

}