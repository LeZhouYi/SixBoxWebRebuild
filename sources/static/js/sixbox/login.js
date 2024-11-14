import { setBackgroundImage,resizeFullScreen,displayErrorMessage,displayError } from "./util/render.js";
import { throttle } from "./util/func.js";
import { postJson } from "./util/requestor.js"


window.onload = function() {
    resizeFullScreen();
    setBackgroundImage("login_background_image", "url('/sources?filename=images/background.jpg')");
};

window.addEventListener("resize", throttle(function(){
    resizeFullScreen("bodyContainer");
}), 200);

document.getElementById("login_form").addEventListener("submit", function(event){
    event.preventDefault();
    const formData = {
        account: document.getElementById("account").value,
        password: document.getElementById("password").value
    };
    postJson("/sessions", formData).then(data=>{
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        window.location.href = "/home.html";
    })
    .catch(error=>{
        displayError(error);
    });
});