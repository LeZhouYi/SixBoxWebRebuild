import * as renderUtil from "./util/render.js";
import * as funcUtil from "./util/func.js";
import * as requestor from "./util/requestor.js";


window.onload = function() {
    renderUtil.resizeFullScreen();
    renderUtil.setBackgroundImage("login_background_image", "url('/sources?filename=images/background.jpg')");
};

window.addEventListener("resize", funcUtil.throttle(function(){
    renderUtil.resizeFullScreen("bodyContainer");
}), 200);

document.getElementById("login_form").addEventListener("submit", function(event){
    event.preventDefault();
    const formData = {
        account: document.getElementById("account").value,
        password: document.getElementById("password").value
    };
    requestor.postJson("/sessions", formData).then(data=>{
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        window.location.href = "/home.html";
    })
    .catch(error=>{
        renderUtil.displayError(error);
    });
});