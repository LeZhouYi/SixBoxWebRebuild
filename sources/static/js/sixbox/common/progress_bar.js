class ProgressBar{
    constructor(containerId, progressId, onClick=null, percentage = "0") {
        this._onClick = onClick;
        this._containerId = containerId;
        this._progressId = progressId;
        this._isDragging = false;
        this._percentage = parseFloat(percentage);

        this.update = this.update.bind(this);
        this.bindEvent = this.bindEvent.bind(this);
        this.bindEvent();
        this.update(this._percentage);
    }

    _onMouseDown(event){
        this._isDragging = true;
    }

    _onMouseUp(event){
        this._isDragging = false;
    }

    _onProgressClick(event){
        callElement(this._containerId, element=>{
            let rect = element.getBoundingClientRect();
            let clickX = event.clientX - rect.left;
            let percentage = (clickX / rect.width * 100).toFixed(0);
            callElement(this._progressId, progressElement=>{
                progressElement.style.width = percentage + "%";
            });
            this._percentage = percentage;
        });
        this._onClick?.(event, this._percentage);
    }

    bindEvent(){
        callElement(this._containerId, element=>{
            element.addEventListener("mousedown", (event)=>this._onMouseDown(event));
            element.addEventListener("click", (event)=>this._onProgressClick(event));
            element.addEventListener("mouseup", (event)=>this._onMouseUp(event));
        });
    }

    update(percentage=0){
        if(!this._isDragging){
            callElement(this._progressId, progressElement=>{
                progressElement.style.width = percentage + "%";
            });
            this._percentage = percentage;
        }
    }

}