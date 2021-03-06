'use strict';

const DEFAULT_OPTIONS = {
    "keyMapping": {
        "normal": {
            ".": "repeatLastCommand",
            "<C-Z>": "toSuspendMode",
            "<Esc>": "toNormalMode",
            "<C-[>": "toNormalMode",
            "f": "toHintMode",
            "F": "toHintFocusMode",
            "t": "toHintMediaMode",
            "T": "toHintCodeMode",
            "i": "toInsertMode",
            "I": "toInsertModeOnFirstElement",
            "A": "toInsertModeOnLastElement",
            "v": "toVisualMode",
            "V": "compose|selectElement|toVisualMode",
            "<C-V>": "toCaretMode",
            ":": "toConsoleMode",
            "s": "toConsoleMode|open",
            "r": "toConsoleModeWithURL|open",
            "S": "toConsoleMode|tabopen",
            "R": "toConsoleModeWithURL|tabopen",
            "b": "toConsoleMode|buffer",
            "B": "toConsoleMode|winbuffer",
            "/": "toSearchMode",
            "?": "toBackwardSearchMode",
            "g<": "showLastMessage",
            "<C-G>": "showPageInfo",
            "g<C-G>": "showElementInfo",
            "o": "smartOpen",
            "O": "smartOpenInTab",
            "c": "compose|mousedown|mouseup|mouseclick",
            "gf": "openSource",
            "wgf": "openSourceInTab",
            "e": "pressEnter",
            "gg": "scrollTop",
            "G": "scrollBottom",
            "M": "scrollVerticalMiddle",
            "gm": "scrollHorizontalMiddle",
            "^": "scrollHome",
            "$": "scrollEnd",
            "k": "scrollUp",
            "j": "scrollDown",
            "h": "scrollLeft",
            "l": "scrollRight",
            "<C-U>": "moveHalfPageUp",
            "<C-D>": "moveHalfPageDown",
            "<C-B>": "movePageUp",
            "<C-F>": "movePageDown",
            "<C-Y>": "scrollLineUp",
            "<C-E>": "scrollLineDown",
            "%": "scrollPercent",
            "zt": "moveTargetAtTop",
            "zz": "moveTargetAtCenter",
            "zb": "moveTargetAtBottom",
            "gj": "selectNextOption",
            "gk": "selectPreviousOption",
            "g~": "toggleSelectOption",
            "n": "searchNext",
            "N": "searchPrevious",
            "*": "searchSelectionForward",
            "#": "searchSelectionBackward",
            "}": "findNextPage",
            "{": "findPreviousPage",
            ";": "focusNext",
            ",": "focusPrevious",
            "_": "resetFocus",
            "gt": "nextTab",
            "gT": "previousTab",
            "J": "nextTab",
            "K": "previousTab",
            "g0": "firstTab",
            "g$": "lastTab",
            "<C-^>": "lastActivatedTab",
            "zp": "toggleTabPinning",
            "<": "moveTabToLeft",
            ">": "moveTabToRight",
            "==": "moveTabToNewWindow",
            "w<": "moveTabToPreviousWindow",
            "w>": "moveTabToNextWindow",
            "u": "undoCloseTab",
            "dd": "removeCurrentTab",
            "dw": "removeCurrentWindow",
            "<C-C>": "stopLoad",
            "<C-L>": "reload",
            "g<C-L>": "reloadSkipCache",
            "<C-O>": "back",
            "<C-I>": "forward",
            "<C-A>": "incrementURL",
            "<C-X>": "decrementURL",
            "gu": "goToParent",
            "gU": "goToRoot",
            "zi": "zoomIn",
            "zo": "zoomOut",
            "zr": "zoomReset",
            "z=": "killHover",
            "yy": "yankCurrentURL",
            "yh": "yankPageHost",
            "yt": "yankPageTitle",
            "yit": "yankInnerHTML",
            "yat": "yankOuterHTML",
            "ye": "yankInnerText",
            "yv": "yankSelection",
            "Y": "smartYank",
            "ww": "focusNextFrame",
            "wh": "focusPreviousFrame",
            "wl": "focusNextFrame",
            "wt": "focusTopFrame",
            "wH": "snapWindowToLeft",
            "wL": "snapWindowToRight",
            "wK": "snapWindowToTop",
            "wJ": "snapWindowToBottom",
            "wf": "openSourceInFrame",
            "w<C-I>": "forwardFrame",
            "w<C-O>": "backFrame",
            "w<C-C>": "stopLoadFrame",
            "w<C-L>": "reloadFrame",
            "w<C-A>": "incrementFrameURL",
            "w<C-X>": "decrementFrameURL",
            "wyy": "yankFrameURL",
            "wyh": "yankFrameHost",
            "wyt": "yankFrameTitle",
            "w<C-G>": "showFrameInfo",
            "<Space><Space>": "playOrPause",
            "<Space>j": "volumeDown",
            "<Space>k": "volumeUp",
            "<Space>h": "seekBack",
            "<Space>l": "seekForward",
            "<Space>+": "speedFaster",
            "<Space>-": "speedSlower",
            "<Space>0": "resetSpeed",
            "<Space>m": "switchMute",
            "<Space>r": "switchLoop",
            "<Space><C-L>": "reloadVideo",
            "<Space><C-G>": "showVideoInfo",
            "<Tab>": "ignore",
            "<S-Tab>": "ignore",
            "<Enter>": "ignore",
            "<C-Enter>": "ignore",
            "<S-Enter>": "ignore",
            "<A-Enter>": "ignore",
            "<M-Enter>": "ignore",
            "<Up>": "ignore",
            "<Down>": "ignore",
            "<Left>": "ignore",
            "<Right>": "ignore",
            "<PageUp>": "ignore",
            "<PageDown>": "ignore",
            "<Home>": "ignore",
            "<End>": "ignore",
        },
        "insert": {
            "<C-Z>": "toSuspendMode",
            "<C-H>": "deleteCharBackward",
            "<C-O><C-H>": "deleteWordBackward",
            "<C-K>": "deleteToEndOfLine",
            "<C-U>": "deleteToBeginningOfLine",
            "<C-F>": "charNext",
            "<C-B>": "charPrevious",
            "<C-A>": "beginLine",
            "<C-E>": "endLine",
            "<C-O>j": "nextLine",
            "<C-O><C-J>": "nextLine",
            "<C-O>k": "previousLine",
            "<C-O><C-K>": "previousLine",
            "<C-O>u": "undo",
            "<C-O><C-U>": "undo",
            "<C-O>y": "yankValue",
            "<C-O><C-Y>": "yankValue",
            "<C-O>p": "pasteValue",
            "<C-O><C-P>": "pasteValue",
            "<C-M>": "compose|pressEnter|toNormalMode",
            "<C-X><C-Y>": "scrollLineUp",
            "<C-X><C-E>": "scrollLineDown",
            "<C-C>": "toNormalMode",
            "<C-[>": "toNormalMode",
            "<Esc>": "toNormalMode",
            "<Tab>": "focusNextAndChangeMode",
            "<S-Tab>": "focusPreviousAndChangeMode",
            "<C-O><Tab>": "toInsertModeOnNextInput",
            "<C-O><C-I>": "toInsertModeOnNextInput",
            "<C-O><S-Tab>": "toInsertModeOnPreviousInput",
        },
        "visual": {
            "h": "extendSelection|backward|character",
            "l": "extendSelection|forward|character",
            "b": "extendSelection|backward|word",
            "w": "extendSelection|forward|word",
            "k": "extendSelection|backward|line",
            "j": "extendSelection|forward|line",
            "(": "extendSelection|backward|sentence",
            ")": "extendSelection|forward|sentence",
            "{": "extendSelection|backward|paragraph",
            "}": "extendSelection|forward|paragraph",
            "^": "extendSelection|backward|lineboundary",
            "$": "extendSelection|forward|lineboundary",
            "gg": "extendSelection|backward|documentboundary",
            "G": "extendSelection|forward|documentboundary",
            "B": "extendSelection|backward|block",
            "W": "extendSelection|forward|block",
            "_": "collapseSelectionToStart",
            "y": "compose|yankSelection|toNormalMode",
            "*": "compose|searchSelectionForward|toNormalMode",
            "#": "compose|searchSelectionBackward|toNormalMode",
            "d": "deleteSelection",
            "<C-]>": "compose|viewSelectionSource|toNormalMode",
            "o": "reverseSelectionEndpoints",
            "c": "compose|mousedown|mouseup|mouseclick",
            "g<C-G>": "showElementInfo",
            "<C-U>": "moveHalfPageUp",
            "<C-D>": "moveHalfPageDown",
            "<C-B>": "movePageUp",
            "<C-F>": "movePageDown",
            "<C-Y>": "scrollLineUp",
            "<C-E>": "scrollLineDown",
            "zt": "moveTargetAtTop",
            "zz": "moveTargetAtCenter",
            "zb": "moveTargetAtBottom",
            "v": "toVisualMode",
            "<C-V>": "toCaretMode",
            "<C-[>": "toNormalMode",
            "<C-C>": "toNormalMode",
            "<Esc>": "toNormalMode",
        },
        "hint": {
            "<C-L>": "reconstruct",
            "<Tab>": "nextHint",
            "<S-Tab>": "previousHint",
            ";": "nextHint",
            ",": "previousHint",
            "/": "startFilter",
            "zz": "toggleOverlap",
            "zf": "toggleAutoFocus",
            "zi": "toggleTransparency",
            "fi": "invokeCommand|0|focusin",
            "fI": "invokeCommand|0|compose|setTabIndex|focusin",
            "fo": "invokeCommand|0|focusout",
            "fO": "invokeCommand|0|compose|removeTabIndex|focusout",
            "i": "invokeCommand|0|compose|mouseoutTo|mouseinTo|fixedFocusin|toInsertModeIfEditable",
            "_": "invokeCommand|0|compose|resetFocus|mouseoutFrom|mouseinFrom",
            "c": "invokeCommand|0|compose|mousedown|mouseup|mouseclick",
            "mc": "invokeCommand|0|mouseclick",
            "mC": "invokeCommand|2|mouseclick",
            "m<C-C>": "invokeCommand|1|mouseclick",
            "m<M-C>": "invokeCommand|8|mouseclick",
            "md": "invokeCommand|0|mousedown",
            "mD": "invokeCommand|2|mousedown",
            "m<C-D>": "invokeCommand|1|mousedown",
            "mu": "invokeCommand|0|mouseup",
            "mU": "invokeCommand|2|mouseup",
            "m<C-U>": "invokeCommand|1|mouseup",
            "mi": "invokeCommand|0|mouseinTo",
            "mI": "invokeCommand|0|mouseinFrom",
            "mo": "invokeCommand|0|mouseoutFrom",
            "mO": "invokeCommand|0|mouseoutTo",
            "mm": "invokeCommand|5|mousemove",
            "e": "invokeCommand|0|pressEnter",
            "E": "invokeCommand|2|pressEnter",
            "<C-E>": "invokeCommand|1|pressEnter",
            "<M-E>": "invokeCommand|8|pressEnter",
            "o": "invokeCommand|0|smartOpen",
            "O": "invokeCommand|0|smartOpenInTab",
            "gf": "invokeCommand|0|openSource",
            "wgf": "invokeCommand|0|openSourceInTab",
            "wf": "invokeCommand|0|openSourceInFrame",
            "yy": "invokeCommand|0|yankLink",
            "yit": "invokeCommand|0|yankInnerHTML",
            "yat": "invokeCommand|0|yankOuterHTML",
            "ye": "invokeCommand|0|yankInnerText",
            "Y": "invokeCommand|0|smartYank",
            "s": "invokeCommand|0|downloadLink",
            "g<C-G>": "invokeCommand|0|showElementInfo",
            "v": "invokeCommand|0|compose|setCaret|toVisualMode",
            "V": "invokeCommand|0|compose|selectElement|toVisualMode",
            "<C-V>": "invokeCommand|0|compose|setCaret|toCaretMode",
            "gj": "invokeCommand|0|selectNextOption",
            "gk": "invokeCommand|0|selectPreviousOption",
            "dat": "invokeCommand|0|deleteElement",
            "dit": "invokeCommand|0|deleteChildElements",
            ".": "invokeCommand|0|repeatLastCommand",
            "<C-C>": "invokeCommand|0|toNormalMode",
            "<C-[>": "invokeCommand|0|toNormalMode",
            "<Esc>": "invokeCommand|0|toNormalMode",
        },
        "console": {
            "<Enter>": "execute",
            "<C-M>": "execute",
            "<C-H>": "deleteCharBackward",
            "<C-O><C-H>": "deleteWordBackward",
            "<C-U>": "deleteToBeginningOfLine",
            "<C-K>": "deleteToEndOfLine",
            "<C-A>": "beginLine",
            "<C-E>": "endLine",
            "<C-F>": "charNext",
            "<C-B>": "charPrevious",
            "<C-X><C-L>": "showHistoryList",
            "<C-I>": "getCandidate",
            "<Tab>": "selectNextHistoryOrCandidate",
            "<S-Tab>": "selectPreviousHistoryOrCandidate",
            "<Down>": "selectNextHistoryOrCandidate",
            "<Up>": "selectPreviousHistoryOrCandidate",
            "<C-C>": "closeConsoleMode",
            "<Esc>": "closeConsoleMode",
            "<C-[>": "closeConsoleMode",
        },
        "suspend": "<C-[>"
    },

    "hintPattern": {
        "global": {
            "link": "*[onmousedown], *[onmouseup], *[onmouseover], *[onmouseout], *[onmousemove], *[onclick], *[oncommand], *[role='link'], *[role='button'], *[role='checkbox'], *[role='radio'], *[role='option'], *[role='menuitem'], *[role='menuitemcheckbox'], *[role='menuitemradio'], input:not([type='hidden']):not([disabled]):not([readonly]), *[contenteditable='true'], *[contenteditable=''], a, button, select, textarea, area, summary, *[tabindex]:not([tabindex='-1'])",
            "focus": "body *",
            "media": "img, canvas, video, object, embed",
            "code": "pre, code, textarea[readonly], h1, h2, h3, h4, h5, h6, p, tr"
        },
        "local": {
            "twitter.com": {
                "link": [
                    ["div.new-tweets-bar.js-new-tweets-bar", "Link to display new tweets"],
                    ["div.dismiss.js-action-dismiss", "Dismiss button of recommended users"],
                    ["h1.Icon.Icon--bird.bird-topbar-etched", "Twitter icon on topbar"]
                ]
            },
            "ja.wikipedia.org": {
                "link": [
                    [
                        "div.mw-ui-icon-popups-close",
                        "Button to close page preview configuration"
                    ]
                ]
            }
        }
    },

    "searchEngine": {
        "defaultEngine": "google",
        "engines": {
            "google": {
                "searchUrl": "https://www.google.co.jp/search?q=%s&ie=utf-8&oe=utf-8&hl=ja",
                "suggest": {
                    "url": "https://suggestqueries.google.com/complete/search?client=firefox&hl=ja&qu=%s",
                    "type": "json",
                    "path": "$[1]",
                    "decode": false
                }
            },
            "twitter": {
                "searchUrl": "https://twitter.com/search?q=%s"
            }
        }
    },

    "pagePattern": {
        "next": "^\\s*((次の?ページへ?|次へ?|(next|newer)(\\s+\\w+)?)(\\s*(›|»|≫|>>?|→))?|»|›|≫|>>?|→)\\s*$",
        "previous": "^\\s*(((‹|«|≪|<<?|←)\\s*)?(前の?ページへ?|前へ?|(prev(ious)?|older)(\\s+\\w+)?)|‹|«|≪|<<?|←)\\s*$"
    },

    "consoleDesign": {
        "backgroundColor": "rgba(0, 0, 0, 0.6)",
        "fontColor": "#ffffff",
        "fontSize": "medium",
        "informationColor": "#ffff00",
        "selectedBackgroundColor": "#008080",
        "selectedFontColor": "#ffffff",
        "selectedInformationColor": "#ffff00",
        "borderColor": "#b3b3b3"
    },

    "miscellaneous": {
        "autoFocus": false,
        "overlapHintLabels": true,
        "autoKillHover": true,
        "onlyVisibility": false,
        "highlightSearch": true,
        "overwriteErrorPage": true,
        "activateNewTab": false,
        "consoleAutocomplete": true,
    }
};

