window.addEventListener("load",function () {
    clickOverlayHidden("text_add_popup_overlay", "text_add_content");
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
            initMce(".form_tinymce_field", function(){
                    displayElementById("text_add_popup_overlay");
                    hiddenFileMenu();
                    spinner.remove();
                });
            }else{
                displayElementById("text_add_popup_overlay");
                hiddenFileMenu();
                spinner.remove();
            }
        } catch (error){
            displayError(error);
            spinner?.remove();
        }
    });
});

function initMce(mceInputId, initCallBack){
    /*初始化富文本编辑框*/
    tinymce.init({
        selector: mceInputId,
        //skin:"oxide-dark",
        language:"zh_CN",
        plugins: "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media code codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help emoticons autosave autoresize",
        toolbar: "code undo redo restoredraft | cut copy paste pastetext | forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent | \
        styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat | \
        table image media charmap emoticons pagebreak insertdatetime preview | fullscreen | bdmap lineheight",
        min_height: 400,
        /*content_css: [ //可设置编辑区内容展示的css，谨慎使用
            "/static/reset.css",
            "/static/ax.css",
            "/static/css.css",
        ],*/
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
        setup: function(editor){
            editor.on("init", function(){
                callElementByClass(".tox.tox-silver-sink.tox-tinymce-aux", menuElement=>{
                    menuElement.style.position = "fixed";
                });
//                tox tox-tinymce tox-tinymce--toolbar-sticky-off
                initCallBack?.();
            });
        }
    });
}