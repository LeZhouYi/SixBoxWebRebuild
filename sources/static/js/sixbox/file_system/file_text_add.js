
callElement("add_text_button", element=>{
    element.addEventListener("click", function(event){
        /*点击弹出新增文本*/
        displayElementById("text_add_popup_overlay");
    });
});