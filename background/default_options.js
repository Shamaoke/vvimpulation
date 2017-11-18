const DEFAULT_OPTIONS = {
    "keyMapping": {
        "normal": {
            ".": "repeatLastCommand",
            "<Esc>": "toNormalMode",
            "<C-[>": "toNormalMode",
            "f": "toHintMode",
            "F": "toHintFocusMode",
            "gF": "toHintMediaMode",
            "I": "toInsertModeOnFirstElement",
            "i": "toInsertMode",
            "A": "toInsertModeOnLastElement",
            "v": "toVisualMode",
            ":": "toExMode",
            "g<": "showLastMessage",
            "o": "smartOpen",
            "O": "smartOpenInTab",
            "<C-G>": "toExModeOpenCurrentURL",
            "t": "toExModeTabOpen",
            "T": "toExModeTabOpenCurrentURL",
            "/": "toSearchMode",
            "?": "toBackwardSearchMode",
            "e": "pressEnter",
            "gg": "scrollTop",
            "M": "scrollMiddle",
            "G": "scrollBottom",
            "^": "scrollHome",
            "$": "scrollEnd",
            "j": "scrollDown",
            "k": "scrollUp",
            "h": "scrollLeft",
            "l": "scrollRight",
            "<C-E>": "scrollLineDown",
            "<C-Y>": "scrollLineUp",
            "<C-D>": "moveHalfPageDown",
            "<C-U>": "moveHalfPageUp",
            "<C-F>": "movePageDown",
            "<C-B>": "movePageUp",
            "%": "scrollPercent",
            "zt": "moveTargetAtTop",
            "zz": "moveTargetAtCenter",
            "zb": "moveTargetAtBottom",
            "gj": "selectNextOption",
            "gk": "selectPreviousOption",
            "g~": "toggleSelectOption",
            "n": "findNext",
            "N": "findPrevious",
            "}": "findNextPage",
            "{": "findPreviousPage",
            "gt": "nextTab",
            "gT": "previousTab",
            "<C-N>": "nextTab",
            "<C-P>": "previousTab",
            "g0": "firstTab",
            "g$": "lastTab",
            "<": "moveTabToLeft",
            ">": "moveTabToRight",
            "dd": "removeCurrentTab",
            "dw": "removeCurrentWindow",
            "u": "undoCloseTab",
            "<C-C>": "stopLoad",
            "<C-L>": "reload",
            "g<C-L>": "reloadSkipCache",
            "<C-O>": "back",
            "<C-I>": "forward",
            "<C-A>": "incrementURL",
            "<C-X>": "decrementURL",
            "gu": "goToParent",
            "gU": "goToRoot",
            "zf": "reloadHintPattern",
            "zi": "zoomIn",
            "zo": "zoomOut",
            "zr": "zoomReset",
            "yy": "yankCurrentURL",
            "yit": "yankInnerHTML",
            "yat": "yankOuterHTML",
            "ye": "yankInnerText",
            "yv": "yankSelection",
            "<Space><Space>": "playOrPause",
            "<Space>j": "volumeDown",
            "<Space>k": "volumeUp",
            "<Space>h": "seekBack",
            "<Space>l": "seekForward",
            "<Space>r": "switchLoop",
            "<Space><C-L>": "reloadVideo",
            "<Space><C-G>": "showVideInfo",
            "<C-W><C-W>": "focusNextFrame",
            "<C-W>w": "focusNextFrame",
            "<C-W><C-T>": "focusTopFrame",
            "<C-W>t": "focusTopFrame",
            "<C-W>o": "openLinkInFrame",
            "<C-W><C-I>": "forwardFrame",
            "<C-W><C-O>": "backFrame",
            "<C-W><C-C>": "stopLoadFrame",
            "<C-W>c": "stopLoadFrame",
            "<C-W><C-L>": "reloadFrame",
            "<C-W>l": "reloadFrame",
            "<C-W><C-A>": "incrementFrameURL",
            "<C-W>a": "incrementFrameURL",
            "<C-W><C-X>": "decrementFrameURL",
            "<C-W>x": "decrementFrameURL",
            "<C-W>y": "yankFrameURL",
            "<C-W><C-G>": "showFrameURL",
        },
        "insert": {
            "<C-H>": "deleteCharBackward",
            "<C-W>": "deleteWordBackward",
            "<C-K>": "deleteToEndOfLine",
            "<C-U>": "deleteToBeggingOfLine",
            "<C-F>": "charNext",
            "<C-B>": "charPrevious",
            "<C-A>": "beginLine",
            "<C-E>": "endLine",
            "<C-N>": "nextLine",
            "<C-P>": "previousLine",
            "<C-O>u": "undo",
            "<C-O><C-U>": "undo",
            "<C-O>y": "yankValue",
            "<C-O><C-Y>": "yankValue",
            "<C-O>p": "pasteValue",
            "<C-O><C-P>": "pasteValue",
            "<C-M>": "pressEnter",
            "<C-C>": "toNormalMode",
            "<C-[>": "toNormalMode",
            "<Esc>": "toNormalMode",
            "<Tab>": "toInsertModeOnNextInput",
            "<S-Tab>": "toInsertModeOnPreviousInput",
        },
        "visual": {
            "h": "move backward character",
            "l": "move forward character",
            "b": "move backward word",
            "w": "move forward word",
            "j": "move forward line",
            "k": "move backward line",
            ")": "move forward sentence",
            "(": "move backward sentence",
            "}": "move forward paragraph",
            "{": "move backward paragraph",
            "0": "move backward lineboundary",
            "$": "move forward lineboundary",
            "G": "move forward documentboundary",
            "gg": "move backward documentboundary",
            "y": "yankSelection",
            "d": "deleteSelection",
            "o": "reverseSelectionEndpoints",
            "c": "toCaretMode",
            "v": "toVisualMode",
            "<C-[>": "toNormalMode",
            "<C-C>": "toNormalMode",
            "<Esc>": "toNormalMode",
        }
    },

    "hintPattern": {
        "global": {
            "link": "*[onmousedown], *[onmouseup], *[onmouseover], *[onmouseout], *[onmousemove], *[onclick], *[oncommand], *[role='link'], *[role='button'], *[role='checkbox'], *[role='radio'], *[role='option'], input:not([type='hidden']):not([disabled]):not([readonly]), *[contenteditable='true'], *[contenteditable=''], a, button, select, textarea, area",
            "focus": "body *",
            "media": "img, canvas, video, object, embed"
        },
        "local": {
            "www.google.co.jp": {
                "link": [
                    ["#cdrlnk", "Link to specify period"]
                ]
            },
            "github.com": {
                "link": [
                    ["#user-links svg.octicon-plus, #user-links img.avatar", "Header dropdown list icons"],
                    ["details.get-repo-select-menu > summary.btn", "Clone or download button"]
                ]
            },
            "twitter.com": {
                "link": [
                    ["div.new-tweets-bar.js-new-tweets-bar", "Link to display new tweets"],
                    ["div.dismiss.js-action-dismiss", "Dismiss button of recommended users"],
                    ["h1.Icon.Icon--bird.bird-topbar-etched", "Twitter icon on topbar"]
                ]
            }
        }
    }
};

