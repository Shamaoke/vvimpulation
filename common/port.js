'use strict';

class PortEventTarget {
    constructor() {
        this.handlers = [];
    }
    addListener(handler) {
        this.handlers.push(handler);
    }
    removeListener(handler) {
        const index = this.handlers.indexOf(handler);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
    }
}

/**
 * A wrapper class for browser.runtime.Port.
 * This class provides request/reply message by sendMessage method.
 */
class Port {
    constructor(port) {
        this.port = port;
        this.id = 0;
        this.pendingTxnMap = new Map();
        this.onDisconnect = new PortEventTarget();
        this.onRequest = new PortEventTarget();
        this.onNotification = new PortEventTarget();

        const disconnectHandler = (port) => this._handleDisconnect(port);
        port.onDisconnect.addListener(disconnectHandler);
        const messageHandler = (msg) => this._handleMessage(msg);
        port.onMessage.addListener(messageHandler);
        const timerId = setInterval(() => this._checkTimeoutTxn(), 20000);
        this.handlers = [ timerId, messageHandler, disconnectHandler ];
    }
    disconnect() {
        this.port.disconnect();
        this._clearHandlers(); // avoid circular reference
    }
    sendMessage(msg) {
        const id = this.id;
        const replyPromise = new Promise((resolve, reject) => {
            this.pendingTxnMap.set(id, [ resolve, reject, false, msg.command ]);
        });
        this.port.postMessage({ type: 'request', id: id, msg: msg });
        this.id = (this.id + 1) % Number.MAX_SAFE_INTEGER;
        return replyPromise;
    }
    postMessage(msg) {
        this.port.postMessage({ type: 'notification', msg: msg });
    }
    get name() {
        return this.port.name;
    }
    get sender() {
        return this.port.sender;
    }

    /**
     * Private Methods
     **/
    _clearHandlers() {
        if (this.handlers) {
            clearInterval(this.handlers[2]);
            this.port.onMessage.removeListener(this.handlers[1]);
            this.port.onDisconnect.removeListener(this.handlers[2]);
            this.handlers = null;
        }
    }
    _handleDisconnect(port) {
        this.onDisconnect.handlers.forEach((handler) => {
            try {
                handler(this, port.error);
            }
            catch (e) {
                console.error('Disconnect handler error:', Port._toString(e));
            }
        });
        this._clearHandlers(); // avoid circular reference
    }
    _handleMessage(msg) {
        switch (msg.type) {
            case 'request':
                this._handleRequest(msg);
                break;
            case 'response':
                this._handleResponse(msg);
                break;
            case 'notification':
                this._handleNotification(msg);
                break;
            default:
                console.error('Invalie message', msg.type, msg.command);
                break;
        }
    }
    _handleRequest(msg) {
        const promiseList = this.onRequest.handlers.map((handler) => {
            try {
                return Promise.resolve(handler(msg.msg, this.port.sender));
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
        Promise.race(promiseList).then((response) => {
            this._safePostMessage({
                type: 'response', id: msg.id, result: 0, msg: response
            });
        }).catch((error) => {
            // Can not send an Error object by postMessage.
            const errorString = Port._toString(error);
            this._safePostMessage({
                type: 'response', id: msg.id, result: 1, msg: errorString
            });
        });
    }
    _handleResponse(msg) {
        const pendingInfo = this.pendingTxnMap.get(msg.id);
        if (!pendingInfo) {
            console.warn('No request for', msg.id, msg.command);
            return;
        }
        this.pendingTxnMap.delete(msg.id);
        if (msg.result === 0) {
            pendingInfo[0](msg.msg);
        }
        else {
            pendingInfo[1](msg.msg);
        }
    }
    _handleNotification(msg) {
        this.onNotification.handlers.forEach((handler) => {
            try {
                handler(msg.msg, this.port.sender);
            }
            catch (e) {
                console.error('Notification handler error:', Port._toString(e));
            }
        });
    }
    _checkTimeoutTxn() {
        this.pendingTxnMap.forEach((txn, id) => {
            if (txn[2]) {
                this.pendingTxnMap.delete(id);
                const command = txn[3];
                txn[1](new Error(`Request timeout (${command})`));
                console.warn(`Request ${id} is timeout: ${command}`);
            }
            else {
                txn[2] = true;
            }
        });
    }
    _safePostMessage(msg) {
        try {
            this.port.postMessage(msg);
        }
        catch (e) {
            console.error(
                `Failed to send message (${msg && msg.toSource()}):`,
                Port._toString(e));
        }
    }
    static _toString(e) {
        if (e === undefined || e === null) {
            return e;
        }
        if (e instanceof Error) {
            return `${e.message} (${e.fileName}:${e.lineNumber})`;
        }
        else {
            return e.toSource();
        }
    }
}

