window.addEventListener("load",function () {
    clickOverlayHidden("msc_collect_add_overlay", "msc_collect_add_content");
    clickOverlayHidden("msc_collect_edit_overlay", "msc_collect_edit_content");
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

callElement("edit_music_set_button", element=>{
    element.addEventListener("click", async function(event){
        /*点击编辑*/
        try{
            let searchInput = document.getElementById("music_search_input");
            if (searchInput.value !== ""){
                displayError("临时合集不能编辑");
                return;
            }
            let nowMscSetId = sessionStorage.getItem("nowMscSetId");
            let mscSetData = await getJsonWithAuth(`/musicSets/${nowMscSetId}?_page=0&_limit=10`);
            callElement("msc_collect_edit_name", inputElement=>{
                inputElement.value = mscSetData.name;
            });
            displayElementById("msc_collect_edit_overlay");
        }catch(error){
            displayError(error);
        }
    });
});

callElement("msc_collect_edit_cancel", element=>{
    element.addEventListener("click", async function(event){
        /*点击取消编辑*/
        hiddenElementById("msc_collect_edit_overlay");
    });
});

callElement("delete_music_set_button", element=>{
    element.addEventListener("click", async function(event){
        /*点击删除合集*/
        let nowMscSetId = sessionStorage.getItem("nowMscSetId");
        let searchInput = document.getElementById("music_search_input");
        if (searchInput.value !== ""){
            displayError("临时合集不需删除");
        }else if(nowMscSetId === "1"){
            displayError("默认合集不能删除");
        }else{
            let nowMscSetId = sessionStorage.getItem("nowMscSetId");
            sessionStorage.setItem("nowControlData", JSON.stringify({
                "id": nowMscSetId,
                "type": "musicSet"
            }));
            confirmPopup.displayText = "确认删除？";
            confirmPopup.display();
        }
    });
});

callElement("msc_collect_edit_form", element=>{
    element.addEventListener("submit", function(event){
        /*点击编辑合集*/
        event.preventDefault();
        let nowMscSetId = sessionStorage.getItem("nowMscSetId");
        let formData = {
            name: document.getElementById("msc_collect_edit_name").value
        };
        putJsonWithAuth(`/musicSets/${nowMscSetId}`, formData).then(data => {
            displayMessage(data.message);
            callElement("music_control_title_text", inputElement=>{
                inputElement.textContent = formData.name;
            });
            hiddenElementById("msc_collect_edit_overlay");
            updateCollectList();
        })
        .catch(error => {
            displayError(error);
        });
    });
});

function binkClickMenuItem(menuItem, data){
    /*绑定点击事件*/
    menuItem.addEventListener("click", function(event){
        let nowMscSetId = sessionStorage.getItem("nowMscSetId");
        let searchInput = document.getElementById("music_search_input");
        if (nowMscSetId === data.id && searchInput.value === "") {
            return;
        }
        sessionStorage.setItem("nowMscSetId", data.id);
        callElement("music_control_title_text", element=>{
            element.textContent = data.name;
        });
        searchInput.value="";
        updateMusicList();
    });
}