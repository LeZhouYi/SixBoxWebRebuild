window.onload = function () {
    resizeFullScreen();
    setBackgroundImage("login_background_image", "url('/sources?filename=images/background.jpg')");
};

window.addEventListener("resize", throttle(function () {
    resizeFullScreen("bodyContainer");
}), 200);

document.getElementById("login_form").addEventListener("submit", function (event) {
    /*点击登录*/
    event.preventDefault();
    let spinner = createSpinner("login_button_panel");
    const formData = {
        account: document.getElementById("account").value,
        password: document.getElementById("password").value
    };
    postJson("/sessions", formData).then(data => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        window.location.href = "/home.html";
        spinner.remove();
    })
    .catch(error => {
        displayError(error);
    })
    .finally(()=>{
        spinner?.remove();
    });
});