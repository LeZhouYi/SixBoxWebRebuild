function setBackgroundImage(className, fileUrl) {
    /*
    设置类名对应元素的图片背景
    className: 元素类名
    fileName: 文件URL
    */
    let elements = document.getElementsByClassName(className);
    Array.from(elements).forEach(element => {
        if (!element.classList.contains(hiddenClass)) {
            element.style.backgroundImage = `url('${fileUrl}')`;
        }
    });
}

async function loadUserInfo(callback){
    /*加载用户信息*/
    try {
        let userInfo = await getJsonWithAuth("/userDetail");
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        callback?.();
    } catch (error) {
        displayError(error);
    }
}

function initBackground() {
    /*初始化主题背景*/
    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    let accessToken = localStorage.getItem("accessToken");
    if(userInfo.background){
        setBackgroundImage("body_default", `api/v1/files/${userInfo.background}/download?token=${accessToken}`);
    }
}