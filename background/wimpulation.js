"use strict";

class TabInfo {
    constructor(tabId) {
        this.tabId = tabId;
        this.mode = "NORMAL";
        this.frameInfoMap = new Map();
        this.modeInfo = undefined;
        this._frameIdListCache = [undefined];
        this._lastSearchInfo = ["", 0];
    }
    get id() {
        return this.tabId;
    }
    getMode() {
        return this.mode;
    }
    setMode(mode, modeInfo) {
        this.mode = mode;
        this.modeInfo = modeInfo;
    }
    frameIdList(continuation) {
        if (this._frameIdListCache) {
            return Promise.resolve(this._frameIdListCache).then(continuation);
        }
        else {
            return this.sendMessage(0, { command: "collectFrameId" })
                .then((frameIdList) => {
                    this._frameIdListCache = frameIdList;
                    return continuation(frameIdList);
                });
        }
    }
    get lastSearchInfo() {
        return this._lastSearchInfo;
    }
    set lastSearchInfo(lastSearchInfo) {
        this._lastSearchInfo = lastSearchInfo;
    }
    setPort(frameId, port) {
        this._frameIdListCache = undefined;
        this.frameInfoMap.set(frameId, port);
    }
    deletePort(frameId, port) {
        this._frameIdListCache = undefined;
        if (this.frameInfoMap.get(frameId) !== port) {
            console.warn(`missmatch ${frameId} port`);
            return false;
        }
        return this.frameInfoMap.delete(frameId);
    }
    forEachPort(func) {
        this.frameInfoMap.forEach(func);
    }
    postMessage(frameId, msg) {
        const port = this.frameInfoMap.get(frameId);
        if (!port) {
            console.warn(
                `port ${this.tabId}-${frameId} is already disconnected`);
            return;
        }
        port.postMessage(msg);
    }
    sendMessage(frameId, msg) {
        const port = this.frameInfoMap.get(frameId);
        if (!port) {
            return Promise.reject(
                `port ${this.tabId}-${frameId} is already disconnected`);
        }
        return port.sendMessage(msg);
    }
}

const gTabInfoMap = new Map();

const HINT_KEY_MAP = Utils.toPreparedCmdMap({
    "<C-C>": { name: "toNormalMode" },
    "<C-[>": { name: "toNormalMode" },
    "<C-L>": { name: "refreshHint" },
    "<Tab>": { name: "incrementHintNum" },
    "<S-Tab>": { name: "decrementHintNum" },
    ";": { name: "incrementHintNum" },
    ",": { name: "decrementHintNum" },
    "ff": { name: "toggleDefaultFocus" },
    "fi": { name: "focusin", frontend: true },
    "fo": { name: "focusout", frontend: true },
    "c": { name: "mouseclick", frontend: true },
    "mc": { name: "mouseclick", frontend: true },
    "mC": { name: "mouseclick", frontend: true, modifiers : { shift: true } },
    "m<C-C>": { name: "mouseclick", frontend: true, modifiers: { ctrl: true } },
    "m<M-C>": { name: "mouseclick", frontend: true, modifiers: { meta: true } },
    "md": { name: "mousedown", frontend: true },
    "mD": { name: "mousedown", frontend: true, modifiers: { shift: true } },
    "m<C-D>": { name: "mousedown", frontend: true, modifiers: { ctrl: true } },
    "mi": { name: "mousein", frontend: true },
    "mo": { name: "mouseout", frontend: true },
    "e": { name: "pressEnter", frontend: true },
    "E": { name: "pressEnter", frontend: true, modifiers: { shift: true } },
    "<C-E>": { name: "pressEnter", frontend: true, modifiers: { ctrl: true } },
    "<M-E>": { name: "pressEnter", frontend: true, modifiers: { meta: true } },
    "o": { name: "smartOpen", frontend: true },
    "O": { name: "smartOpenInTab", frontend: true },
    "y": { name: "yankLink", frontend: true },
    "s": { name: "downloadLink", frontend: true },
});
class HintCommand {
    static toNormalMode(tabInfo, mode) {
        changeMode(tabInfo, "NORMAL");
    }
    static incrementHintNum(tabInfo, mode) {
        mode.changeHintNum(mode.getNextIndex(), tabInfo);
    }
    static decrementHintNum(tabInfo, mode) {
        mode.changeHintNum(mode.getPreviousIndex(), tabInfo);
    }
    static refreshHint(tabInfo, mode) {
        const type = mode.getType();
        tabInfo.sendMessage(0, {
            command: "collectHint",
            pattern: gHintPatternMap[type],
            isFocusType: (type === "focus")
        }).then(
            (hintsInfoList) => changeHintMode(tabInfo, hintsInfoList, mode),
            handleError);
    }
    static toggleDefaultFocus(tabInfo, mode) {
        mode.toggleDefaultFocus();
    }
}
class HintMode {
    constructor(type) {
        this.type = type;
        this.idList = [];
        this.currentIndex = 0;
        this.defaultFocus = true;
        this.mapper = Utils.makeCommandMapper(HINT_KEY_MAP);
    }
    handle(key, sender, tabInfo) {
        if (key.length === 1 && "0" <= key && key <= "9") {
            this._handleDigit(key, tabInfo);
            return;
        }
        const [consumed, optCmd, cmd] = this.mapper.get(key);
        if (optCmd) {
            this._invoke(optCmd, tabInfo);
        }
        if (cmd) {
            this._invoke(cmd, tabInfo);
        }
        else if (!consumed) {
            changeMode(tabInfo, "NORMAL", sender.frameId, [key]);
        }
    }
    _invoke(cmd, tabInfo) {
        if (cmd.frontend) {
            const currentFrameId = this.idList[this.currentIndex];
            const modifiers = cmd.modifiers || {};
            const count = Utils.modifiersToCount(
                modifiers.ctrl, modifiers.shift, modifiers.alt, modifiers.meta);
            HintMode._forwardHintCommand(
                tabInfo, currentFrameId, { command: cmd.name, count: count });
        }
        else {
            HintCommand[cmd.name](tabInfo, this);
        }
    }
    _handleDigit(num, tabInfo) {
        const length = this.idList.length;
        let index = this.currentIndex.toString() + num;
        while (index && parseInt(index, 10) >= length) {
            index = index.substring(1);
        }
        const nextIndex = (index ? parseInt(index, 10) : length - 1);

        this.changeHintNum(nextIndex, tabInfo);
    }

    getType() {
        return this.type;
    }
    getPreviousIndex() {
        const length = this.idList.length;
        return (this.currentIndex - 1 + length) % length;
    }
    getNextIndex() {
        return (this.currentIndex + 1) % this.idList.length;
    }
    toggleDefaultFocus() {
        this.defaultFocus = !this.defaultFocus;
    }
    setIdList(idList) {
        this.idList = idList;
        this.currentIndex = 0;
        this.mapper.reset();
    }
    changeHintNum(nextIndex, tabInfo) {
        const prevId = this.idList[this.currentIndex];
        const nextId = this.idList[nextIndex];
        if (prevId !== nextId) {
            HintMode._forwardHintCommand(
                tabInfo, prevId, { command: "blurHintLink" });
        }
        HintMode._forwardHintCommand(tabInfo, nextId, {
            command: "focusHintLink",
            index: nextIndex, defaultFocus: this.defaultFocus
        });
        this.currentIndex = nextIndex;
    }
    static _forwardHintCommand(tabInfo, frameId, msg) {
        return tabInfo.sendMessage(
            frameId, { command: "forwardHintCommand", data: msg });
    }
}

function handleError(error) {
    if (error === undefined) {
        error = 'some error occured';
    }
    if (error instanceof Error) {
        console.error(error.message, error.lineNumber, error.fileName);
    }
    else {
        console.error(error);
    }
    browser.notifications.create("wimpulation-error-notification", {
        type: "basic",
        message: error.toString(),
        title: "wimpulation error",
    });
}

function selectTab(tabId, getIndex) {
    browser.tabs.get(tabId).then((tab) => {
        return browser.tabs.query({ windowId: tab.windowId }).then((tabs) => {
            const index = getIndex(tab.index, tabs.length);
            browser.tabs.update(tabs[index].id, { active: true });
        });
    }, handleError);
}

function moveTab(tabId, distance, toLeft) {
    browser.tabs.get(tabId).then((tab) => {
        return browser.tabs.query({ pinned: tab.pinned, windowId: tab.windowId })
            .then((tabs) => {
                const cmpFunc = (toLeft
                    ? (lhs, rhs) => rhs.index - lhs.index
                    : (lhs, rhs) => lhs.index - rhs.index);
                tabs.sort(cmpFunc);
                const currIndex = tabs.findIndex((elem) => elem.id === tabId);
                if (currIndex === -1) {
                    console.warn("not found tab", tabId);
                    return;
                }
                const newIdx = tabs[(currIndex + distance) % tabs.length].index;
                browser.tabs.move(
                    tabId, { windowId: tab.windowId, index: newIdx });
        });
    }, handleError);
}

function findAllFrame(tabInfo, keyword, startIndex, frameIdList, backward) {
    const msg = { command: "find", keyword: keyword, backward: backward };
    const diff = (backward ? -1 : 1);
    const length = frameIdList.length;
    const findFrame = (i) => {
        const index = (startIndex + i * diff + length) % length;
        msg.reset = (i !== 0);
        return tabInfo.sendMessage(frameIdList[index], msg)
            .then((result) => {
                if (result) {
                    tabInfo.lastSearchInfo = [keyword, index];
                    return true;
                }
                if (i === length) {
                    tabInfo.lastSearchInfo = [keyword, 0];
                    return false;
                }
                else {
                    return findFrame(i + 1);
                }
            });
    };
    return findFrame(0);
}
class Command {
    static focusNextFrame(msg, sender, tabInfo) {
        const count = Math.max(msg.count, 1);
        tabInfo.frameIdList((frameIdList) => {
            const index = frameIdList.indexOf(sender.frameId);
            tabInfo.sendMessage(
                frameIdList[(index + count) % frameIdList.length],
                { command: "focusFrame" });
        });
    }
    static find(msg, sender, tabInfo) {
        tabInfo.frameIdList((frameIdList) => {
            const [keyword, index] = tabInfo.lastSearchInfo;
            const startIndex = (keyword === msg.keyword ? index : 0);
            return findAllFrame(
                tabInfo, msg.keyword, startIndex, frameIdList, msg.backward)
        });
    }
    static findNext(msg, sender, tabInfo) {
        const [keyword, index] = tabInfo.lastSearchInfo;
        if (keyword === "") {
            return;
        }
        tabInfo.frameIdList((frameIdList) => {
            findAllFrame(tabInfo, keyword, index, frameIdList, false);
        });
    }
    static findPrevious(msg, sender, tabInfo) {
        const [keyword, index] = tabInfo.lastSearchInfo;
        if (keyword === "") {
            return;
        }
        tabInfo.frameIdList((frameIdList) => {
            findAllFrame(tabInfo, keyword, index, frameIdList, true);
        });
    }

    static nextTab(msg, sender, tabInfo) {
        const tab = sender.tab;
        const count = msg.count;
        if (count === 0) {
            selectTab(tab.id, (index, tabLen) => (index + 1) % tabLen);
        }
        else {
            selectTab(
                tab.id, (index, tabLen) => (count < tabLen) ?  count : index);
        }
    }
    static previousTab(msg, sender, tabInfo) {
        const count = Math.max(msg.count, 1);
        selectTab(
            sender.tab.id,
            (index, tabLen) => (index + tabLen - (count % tabLen)) % tabLen);
    }
    static firstTab(msg, sender, tabInfo) {
        selectTab(sender.tab.id, (index, tabLen) => 0);
    }
    static lastTab(msg, sender, tabInfo) {
        selectTab(sender.tab.id, (index, tabLen) => tabLen - 1);
    }
    static moveTabToLeft(msg, sender, tabInfo) {
        moveTab(sender.tab.id, Math.max(msg.count, 1), true);
    }
    static moveTabToRight(msg, sender, tabInfo) {
        moveTab(sender.tab.id, Math.max(msg.count, 1), false);
    }
    static removeCurrentTab(msg, sender, tabInfo) {
        browser.tabs.remove(sender.tab.id);
    }
    static undoCloseTab(msg, sender, tabInfo) {
        browser.sessions.getRecentlyClosed().then((sessions) => {
            const tabSessions = sessions.filter((s) => s.tab !== undefined);
            if (tabSessions.length === 0) {
                return;
            }
            const tab = tabSessions[Math.min(msg.count, tabSessions.length - 1)];
            return browser.sessions.restore(tab.tab.sessionId);
        }, handleError);
    }
    static duplicateTab(msg, sender, tabInfo) {
        browser.tabs.duplicate(sender.tab.id);
    }
    static openTab(msg, sender, tabInfo) {
        browser.tabs.get(sender.tab.id).then((tab) => {
            return browser.tabs.create(
                { index: tab.index + 1, windowId: tab.windowId });
        }, handleError);
    }
    static removeCurrentWindow(msg, sender, tabInfo) {
        browser.tabs.get(sender.tab.id).then((tab) => {
            return browser.windows.remove(tab.windowId);
        }, handleError);
    }
    static reload(msg, sender, tabInfo) {
        browser.tabs.reload(sender.tab.id);
    }
    static reloadSkipCache(msg, sender, tabInfo) {
        browser.tabs.reload(sender.tab.id, { bypassCache: true });
    }
    static zoomIn(msg, sender, tabInfo) {
        const tabId = sender.tab.id;
        const count = Math.max(msg.count, 1);
        browser.tabs.getZoom(tabId).then((factor) => {
            browser.tabs.setZoom(tabId, Math.min(factor + count / 10, 3));
        }, handleError);
    }
    static zoomOut(msg, sender, tabInfo) {
        const tabId = sender.tab.id;
        const count = Math.max(msg.count, 1);
        browser.tabs.getZoom(tabId).then((factor) => {
            browser.tabs.setZoom(tabId, Math.max(factor - count / 10, 0.3));
        }, handleError);
    }
    static zoomReset(msg, sender, tabInfo) {
        browser.tabs.setZoom(sender.tab.id, 0);
    }
    static openLink(msg, sender, tabInfo) {
        browser.tabs.update(sender.tab.id, { url: msg.url });
    }
    static openLinkInTab(msg, sender, tabInfo) {
        browser.tabs.get(sender.tab.id).then((tab) => {
            // TODO openerTabId
            browser.tabs.create(
                { url: msg.url, index: tab.index + 1, active: msg.active });
        }, handleError);
    }
    static downloadLink(msg, sender, tabInfo) {
        browser.downloads.download({
            url: msg.url, /* TODO incognito: tab.incognito,*/ saveAs: true
        }, handleError);
    }

    static reloadHintPattern(msg, sender, tabInfo) {
        loadHintPattern();
    }

    static toHintMode(msg, sender, tabInfo) {
        const type = msg.type;
        tabInfo.sendMessage(0, {
            command: "collectHint",
            pattern: gHintPatternMap[type],
            isFocusType: (type === "focus")
        }).then((hintsInfoList) => {
            changeHintMode(tabInfo, hintsInfoList, new HintMode(type))
        }, handleError);
    }
    static collectHint(msg, sender, tabInfo) {
        return tabInfo.sendMessage(msg.frameId, msg);
    }
    static forwardHintKeyEvent(msg, sender, tabInfo) {
        if (tabInfo.getMode() !== "HINT") {
            return;
        }
        return tabInfo.modeInfo.handle(msg.key, sender, tabInfo);
    }

    static collectFrameId(msg, sender, tabInfo) {
        return tabInfo.sendMessage(msg.frameId, msg);
    }

    static forwardCommand(msg, sender, tabInfo) {
        tabInfo.sendMessage(msg.frameId, msg);
    }

    static execCommand(msg, sender, tabInfo) {
        return browser.tabs.get(sender.tab.id).then((tab) => {
            return gExCommandMap.execCommand(msg.cmd, tab)
                .then((result) => [result, tab.incognito]);
        });
    }
    static getCandidate(msg, sender, tabInfo) {
        return browser.tabs.get(sender.tab.id).then((tab) => {
            return gExCommandMap.getCandidate(msg.value, sender.tab);
        });
    }

    static toNormalMode(msg, sender, tabInfo) {
        changeMode(tabInfo, "NORMAL");
    }
    static toConsoleMode(msg, sender, tabInfo) {
        const mode = "CONSOLE";
        tabInfo.setMode(mode);
        tabInfo.postMessage(
            0, { command: "changeMode", mode: mode, data: msg.data });
    }
    static showConsole(msg, sender, tabInfo) {
        return tabInfo.sendMessage(0, msg);
    }
}

function changeHintMode(tabInfo, idList, hintMode) {
    if (idList.length === 0) {
        return;
    }
    const mode = "HINT";
    let labelMap = {};
    idList.forEach((id, index) => {
        if (!labelMap[id]) {
            labelMap[id] = [];
        }
        labelMap[id].push(index);
    });
    hintMode.setIdList(idList);
    tabInfo.setMode(mode, hintMode);
    tabInfo.forEachPort((port, id) => {
        const labelList = labelMap[id] || [];
        port.postMessage({ command: "changeMode", mode: mode, data: labelList });
    });
}

function changeMode(tabInfo, mode, frameId = undefined, data = undefined) {
    tabInfo.setMode(mode);
    const msg = { command: "changeMode", mode: mode };
    tabInfo.forEachPort((port, id) => {
        if (id === frameId) {
            port.postMessage(Object.assign({ data: data }, msg));
        }
        else {
            port.postMessage(msg)
        }
    });
}

let gHintPatternMap = undefined;
function loadHintPattern() {
    const url = browser.runtime.getURL("resources/hint_pattern.json");
    const headers = new Headers(
        { "Content-Type": "application/x-suggestions+json" });
    fetch(url, { header: headers })
        .then((response) => response.json())
        .then((json) => gHintPatternMap = json, handleError);
}
loadHintPattern();

browser.tabs.onActivated.addListener((activeInfo) => {
    const tabInfo = gTabInfoMap.get(activeInfo.tabId);
    if (!tabInfo) {
        return;
    }
    changeMode(tabInfo, "NORMAL");
});

browser.runtime.onMessage.addListener(invokeCommand);

browser.runtime.onConnect.addListener((port) => {
    const sender = port.sender;
    port = new Port(port);
    const tab = sender.tab;
    if (!tab) {
        console.warn("no tab exist");
        return;
    }
    const tabId = tab.id;
    if (tabId === browser.tabs.TAB_ID_NONE) {
        console.info("TAB_ID_NONE:", tab);
        return;
    }

    const frameId = sender.frameId;

    port.onNotification.addListener(invokeCommand);
    port.onRequest.addListener(invokeCommand);
    port.onDisconnect.addListener(clearnupFrameInfo.bind(null, tabId, frameId));

    if (!gTabInfoMap.has(tabId)) {
        gTabInfoMap.set(tabId, new TabInfo(tabId));
    }
    const tabInfo = gTabInfoMap.get(tabId);
    tabInfo.setPort(frameId, port);
    port.postMessage({
        command: "registerFrameId", frameId: frameId, mode: tabInfo.getMode()
    });
});
function invokeCommand(msg, sender) {
    const tabInfo = gTabInfoMap.get(sender.tab.id);
    if (!tabInfo) {
        console.warn(`tabInfo for ${sender.tab.id} is not found`);
        return;
    }
    return Command[msg.command](msg, sender, tabInfo);
}
function clearnupFrameInfo(tabId, frameId, port, error) {
    console.debug(`Port(${tabId}-${frameId}) is disconnected: ${error}`);
    const tabInfo = gTabInfoMap.get(tabId);
    if (!tabInfo) {
        if (frameId === 0) {
            console.warn(`tabInfo for ${tabId} is already deleted`);
        }
        return;
    }
    tabInfo.deletePort(frameId, port);
    if (frameId === 0) {
        gTabInfoMap.delete(tabId);
    }
}

