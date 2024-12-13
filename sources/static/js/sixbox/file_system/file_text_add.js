window.addEventListener("load",function () {
    clickOverlayHidden("text_add_popup_overlay", "text_add_content");
});

callElement("text_add_form", element=>{
    element.addEventListener("submit", function(event){
        /*点击新增富文本*/
        event.preventDefault();
        let spinner = createSpinner("text_add_button_panel");
        let formData = {
            name: document.getElementById("text_add_name").value,
            parentId: document.getElementById("text_add_folder_select").value,
            content: tinymce.get("text_tinymce_field").getContent()
        };
        postJsonWithAuth("/texts", formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("text_add_popup_overlay");
            updateFileList();
        })
        .catch(error => {
            displayError(error);
        })
        .finally(()=>{
            spinner?.remove();
        });
    });
});

callElement("text_add_cancel", element=>{
    element.addEventListener("click", function(event){
        /*隐藏弹窗*/
        hiddenElementById("text_add_popup_overlay");
    });
});

callElement("add_text_button", element=>{
    element.addEventListener("click", function(event){
        /*点击弹出新增文本*/
        let menuElement = document.querySelector(".tox.tox-silver-sink.tox-tinymce-aux");
        let spinner = createSpinner("add_text_button","spin_panel");
        try{
            if(!menuElement){
                let nowFolderId = localStorage.getItem("nowFolderId");
                loadFolderSelect("text_add_folder_select", nowFolderId);
                initMce(".form_tinymce_field", function(){
                        displayElementById("text_add_popup_overlay");
                        hiddenFileMenu();
                    });
            }else{
                displayElementById("text_add_popup_overlay");
                hiddenFileMenu();
            }
        } catch (error){
            displayError(error);
        } finally{
            spinner?.remove();
        }
    });
});

function initMce(mceInputId, initCallBack){
    /*初始化富文本编辑框*/
    tinymce.init({
        selector: mceInputId,
        //skin:"oxide-dark",
        language: "zh_CN",
        plugins: "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media code codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help emoticons autosave autoresize",
        toolbar: "code undo redo restoredraft | cut copy paste pastetext | forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent | \
            styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat | \
            table image media charmap emoticons pagebreak insertdatetime preview | fullscreen | bdmap lineheight",
        min_height: 400,
        fontsize_formats: "12px 14px 16px 18px 24px 36px 48px 56px 72px",
        font_formats: "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;",
        importcss_append: true,
        //自定义文件选择器的回调内容
        toolbar_sticky: false,
        autosave_ask_before_unload: false,
        elementpath: true,
        branding: false,
        promotion: false,
        license_key: "gpl",
        fullscreen_native: true,
        setup: function(editor){
            editor.on("init", function(){
                callElementByClass(".tox.tox-silver-sink.tox-tinymce-aux", tinymceElement=>{
                    tinymceElement.style.position = "fixed";
                    document.addEventListener("fullscreenchange", onTinyMceScreenChange);
                    document.addEventListener("mozfullscreenchange", onTinyMceScreenChange);
                    document.addEventListener("webkitfullscreenchange", onTinyMceScreenChange);
                    document.addEventListener("msfullscreenchange", onTinyMceScreenChange);
                });
                initCallBack?.();
            });
        }
    });
}

function onTinyMceScreenChange(){
    /*当编辑器的全屏进入/退出*/
    callElementByClass(".tox.tox-tinymce.tox-edit-focus.tox-fullscreen", tinymceElement=>{
        callElement("text_add_popup_overlay", overlayElement=>{
            if(!isHidden(overlayElement)){
                let fullscreenElement = (
                    document.fullscreenElement || document.mozFullScreenElement ||
                    document.webkitFullscreenElement || document.msFullscreenElement
                );
                if (fullscreenElement){
                    tinymceElement.style.borderRadius = "0px";
                }else{
                    tinymceElement.style.borderRadius = "inherit";
                }
            }
        })
    });
}