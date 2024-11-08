import { setBackgroundImage,resizeFullScreen,displayErrorMessage } from "./util/render.js";
import { throttle } from "./util/func.js";
import { ApiError,postJson } from "./util/requestor.js"


window.onload = function() {
    resizeFullScreen();
    setBackgroundImage("login_image", "url('/sources?filename=images/background.jpg')");
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
    postJson("/api/v1/sessions", formData).then(data=>{
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        window.location.href = "/home.html";
    })
    .catch(error=>{
        if (error instanceof ApiError){
            displayErrorMessage(error.responseData.message);
        }else{
            displayErrorMessage(error);
        }
    });
});