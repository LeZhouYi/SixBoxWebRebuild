export function setBackgroundImage(className, fileUrl){
    /*
    设置类名对应元素的图片背景
    className: 元素类名
    fileName: 文件URL
    */
    var elements = document.getElementsByClassName(className);
    console.log(typeof elements);
    Array.from(elements).forEach(element => {
        element.style.backgroundImage = fileUrl;
    });
}