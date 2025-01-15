window.addEventListener("load",function () {
    clickOverlayHidden("msc_collect_add_overlay", "msc_collect_content");
});

callElement("add_collect_button", element=>{
    /*点击新增合集弹窗*/
    element.addEventListener("click", function(event){
        displayElementById("msc_collect_add_overlay");
    });
});

callElement("msc_collect_add_cancel", element=>{
    /*取消新增合集*/
    element.addEventListener("click", function(event){
        hiddenElementById("msc_collect_add_overlay");
    });
});

callElement("msc_collect_add_form", formElement=>{
    /*提交新增合集*/
    formElement.addEventListener("submit", function(event){
        event.preventDefault();
        let formData = {
            name: document.getElementById("msc_collect_add_name").value
        };
        postJsonWithAuth("/musicSets", formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("msc_collect_add_overlay");
            updateCollectList();
        })
        .catch(error => {
            displayError(error);
        });
    });
});