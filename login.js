// Login Page

document.getElementById("loginPageButton").addEventListener("click", async function() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {

        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("token", data.token);

            window.location.href = "index.html";

        } else {

            document.getElementById("loginMessage").textContent =
                data.message;
        }

    } catch (error) {

        document.getElementById("loginMessage").textContent =
            "Unable to connect to server.";
    }

});
// Go to Signup Page

document.getElementById("showSignupButton").addEventListener("click", function() {

    window.location.href = "signup.html";

});