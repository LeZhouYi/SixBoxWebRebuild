const hiddenClass = "hidden";

export function setBackgroundImage(className, fileUrl){
    /*
    设置类名对应元素的图片背景
    className: 元素类名
    fileName: 文件URL
    */
    var elements = document.getElementsByClassName(className);
    Array.from(elements).forEach(element => {
        if(!element.classList.contains(hiddenClass)){
            element.style.backgroundImage = fileUrl;
        }
    });
}

export function resizeFullScreen(){
    /*计算并调整页页使用适应全屏*/
    let bodyContainer = document.body;
    bodyContainer.style.height = String(document.documentElement.clientHeight)+"px";
}

export function displayErrorMessage(errorMessageText){
    /*显示错误信息*/
    let errorsContainer = document.querySelector(".error_message_container");
    if (errorsContainer){
        const errorMessage = document.createElement('div');
        errorMessage.textContent = errorMessageText;
        errorMessage.classList.add('error_message_item');
        errorsContainer.appendChild(errorMessage);
    }
}