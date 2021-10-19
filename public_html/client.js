$(document).ready(function() {
    let login = $("#logInBtn");
    let signUp = $("#signUpBtn");

    login.click(()=>{
        if($("#form2").valid()){
            let userField = $("#userOemail").val();
            let pass = $("#pass").val();
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: ((!userField.includes("@"))?userField:""),
                    email: ((userField.includes("@"))?email:""),
                    password: pass
                    }),
                }).then(function(res){
                    if(res.status === 200){
                        console.log("success");
                        window.location.pathname = '/members'
                    } else if(res.status === 401){
                        console.log("UNAUTHORIZED");
                        alert("Invalid Credentials");
                    } else {
                        console.log("server error");
                    }
                }).catch((error) => {console.log(error)});
            }
    });

    signUp.click(()=>{
        if($("#form1").valid()){
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first: $("#first").val(), 
                    last: $("#last").val(), 
                    user: $("#user").val(),
                    email: $("#email").val(),
                    pass1: $("#pass1").val(),
                    pass2: $("#pass2").val(),
                    birthday: $("#Birthday").val(),
                    location: $("#City").val()
                    }),
                }).then(function(res){
                    if(res.status === 200){
                        console.log("success");
                        window.location.pathname = '/members'
                    } else {
                        console.log("Bad Request " + res.status);
                    }
                }).catch((error) => {console.log(error)});
            }
    });

    $("#form1").submit(function(e){
        e.preventDefault();
    }).validate({
        rules: {
            first : {
                required: true,
                minlength: 1
                },
            last : {
                required: true,
                minlength: 1
                },
            user : {
                required: true,
                minlength: 4,
                maxlength: 15
                },
            pass1 : {
                required: true,
                minlength: 6,
                maxlength: 24
                },
            pass2 : {
                required: true,
                equalTo: "#pass1"
                },
            email: {
                required: true,
                email: true
            }
        },
        messages : {
            first : {
                minlength: "First name should have at least 1 character"
                },
            last : {
                minlength: "Last name should have at lease 1 character"
                },
            user : {
                minlength: "Username must be at least 4 characters",
                maxlength: "Username cannot exceed 15 characters"
                },
            pass1 : {
                minlength: "Password must have atleast 6 characters",
                maxlength: "Password cannot exceed 24 chracters"
                },
            pass2 : {
                equalTo: "Passwords must match"
                },
            email: {
                email: "email should be in the format: abc@domain.tld"
            }

        }
    });

    $("#form2").submit(function(e){
        e.preventDefault();
    }).validate({
        rules: {
            userOemail : {
                required: true,
                minlength: 4
            },
            pass : {
                required: true,
                minlength: 6
            },
        },
        messages : {
            userOemail:{
                required: "Enter username"
            }
        }
    });

});