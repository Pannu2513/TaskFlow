// Signup Page

document.getElementById("signupPageButton").addEventListener("click", async function() {

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {

        const response = await fetch("http://localhost:3000/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {

            document.getElementById("signupMessage").textContent =
                "Account created successfully!";

            setTimeout(function() {
                window.location.href = "login.html";
            }, 1000);

        } else {

            document.getElementById("signupMessage").textContent =
                data.message;
        }

    } catch (error) {

        document.getElementById("signupMessage").textContent =
            "Unable to connect to server.";

    }

});


// Back to Login

document.getElementById("backToLoginButton").addEventListener("click", function() {

    window.location.href = "login.html";

});