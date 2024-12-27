function setNavigationBarTitle(title,elementId="navigation_header_title"){
    /*设置导航栏标题*/
    callElement(elementId, element=>{
        element.textContent = title;
    })
}