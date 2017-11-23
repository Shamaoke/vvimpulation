'use strict';

class InsertMode {
    constructor(frameInfo, keyMap, data) {
        this.mapper = Utils.makeCommandMapper(keyMap);
        this.lastFocusedElem = document.activeElement;
        this.target = data.editableElement;
        this.target.undoStack = [];
        this.target.focus();
        if (document.activeElement !== this.target) {
            throw new Error(`Target element is not focusable (${this.target})`);
        }
        this.target.classList.add("wimpulation-input");
        this.inInvoking = false;
        frameInfo.setEventListener(this.target, "blur", (e, frameInfo) => {
            if (this.inInvoking) {
                return;
            }
            frameInfo.changeMode("NORMAL");
        }, true);
    }
    static getModeName() {
        return "INSERT";
    }
    getTarget() {
        return this.target;
    }
    consume(key, frameInfo) {
        return this.mapper.get(key);
    }
    onReset() {
        try {
            this.target.classList.remove("wimpulation-input");
            if (document.activeElement === this.target) {
                this.target.blur(); // Prevent IME from stealing key events.
                if (document.hasFocus && this.lastFocusedElem) {
                    this.lastFocusedElem.focus();
                }
            }
        }
        catch (e) {
            console.warn("Some error occured:", Utils.errorString(e));
        }
    }
    onInvoking(cmd, frameInfo) {
        this.inInvoking = true;
        try {
            return !invokeCommand(cmd, 0, frameInfo);
        }
        finally {
            this.inInvoking = false;
        }
    }
    onDropKeys(dropKeys) {
    }
    onNonConsumed(key) {
        if (key.length === 1
            || key === "<Space>" || key === "<S-Space>"
            || key === "<Backspace>" || key === "<Delete>"
            || key === "<Enter>") {
            this.target.undoStack.push(this.target.value);
        }
        return false;
    }
}

