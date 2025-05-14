class ConfirmPopup {
    static overlayId = "confirm_popup_overlay";
    static contentId = "confirm_popup_content";
    static cancelButtonId = "cancel_popup_button";
    static confirmButtonId = "confirm_popup_button";
    static spinnerId = "confirm_spin_panel";
    static popupTextId = "confirm_pop_text";

    constructor(displayText="确认？",onConfirm=null,onCancel=null){
        /*
            onConfirm 点击确认按钮时的回调
            onCancel 点击取消按钮时的回调
        */
        this._onConfirm = onConfirm;
        this._onCancel = onCancel;
        this.displayText = displayText;

        this.init = this.init.bind(this);
        this.bindEvent = this.bindEvent.bind(this);
        this.display = this.display.bind(this);
        this.confirm = this.confirm.bind(this);
        this.cancel = this.cancel.bind(this);
        this.hide = this.hide.bind(this);
    }

    bindEvent(key,func){
        /*绑定回调函数*/
        if(key === "onConfirm"){
            this._onConfirm = func;
            callElement(ConfirmPopup.confirmButtonId, element=>{
                element.removeEventListener("click", this.confirm)
                element.addEventListener("click", this.confirm);
            });
        } else if (key === "onCancel"){
            this.onCancel = func;
            callElement(ConfirmPopup.cancelButtonId, element=>{
                element.removeEventListener("click", this.cancel)
                element.addEventListener("click", this.cancel);
            });
        }
    }

    confirm(event){
        /*确认*/
        let spinner = createSpinner(ConfirmPopup.spinnerId);
        try{
            this._onConfirm?.(event);
        } catch(error){
            displayErrorMessage(error);
        } finally {
            spinner?.remove();
        }
    }

    cancel(event){
        /*取消*/
        try{
            hiddenElementById(ConfirmPopup.overlayId);
            this._onCancel?.(event);
        } catch(error){
            displayErrorMessage(error);
        }
    }

    init(){
        /*初始化*/
        window.addEventListener("load",function () {
            /*点击元素外关闭*/
            clickOverlayHidden(ConfirmPopup.overlayId, ConfirmPopup.contentId);
        });
        callElement(ConfirmPopup.cancelButtonId, element=>{
            element.addEventListener("click", this.cancel);
        });
        callElement(ConfirmPopup.confirmButtonId, element=>{
            element.addEventListener("click", this.confirm);
        });
    }

    display(){
        /*显示弹窗*/
        callElement(ConfirmPopup.popupTextId, element=>{
            element.textContent = this.displayText;
        });
        displayElementById(ConfirmPopup.overlayId);
    }

    hide(){
        /*隐藏弹窗*/
        hiddenElementById(ConfirmPopup.overlayId);
    }
}