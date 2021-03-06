var wsUri = getServerRootUri() + "/chat";
var currentUsername = "";
var chatWebSocket;

function getServerRootUri() {
    return "ws://" + (document.location.hostname === "" ? "localhost" : document.location.hostname) + ":" +
        (document.location.port === "" ? "8080" : document.location.port);
}

function init() {
    refreshForSignInOut();
}

function signIn() {
    var retVal = prompt("Please enter your name : ", "user-name", "");
    if (retVal !== "") {
        currentUsername = retVal;
        chatWebSocket = new WebSocket(wsUri, "chat");

        chatWebSocket.onopen = function (evt) {
            chatWebSocket.send("unmsg" + currentUsername);
        };
        chatWebSocket.onmessage = function (evt) {
            onMessage(evt)
        };
        chatWebSocket.onerror = function (evt) {
            onError(evt)
        };
        chatWebSocket.onclose = function (evt) {
            onClose(evt);
        }
    }
}

function onMessage(evt) {
    var mString = evt.data.toString();

    if (mString.search("unmsg") === 0) {
        currentUsername = mString.substring(5, mString.length);
        refreshForSignInOut();
    }

    if (mString.search("ctmsg") === 0) {
        var transcriptUpdate = mString.substring(6, mString.length);
        writeTranscript(transcriptUpdate);
    }

    if (mString.search("ulupd") === 0) {
        var updateString = mString.substring(6, mString.length);
        writeUserlist(updateString);
    }
}

function onError(evt) {
    alert("Error: " + evt.data);
}

function onClose() {
    currentUsername = "";
    refreshForSignInOut();
}

function isSignedIn() {
    return (currentUsername !== "");
}

function button_signInOut() {
    if (isSignedIn()) {
        chatWebSocket.send("sorq" + currentUsername);
    } else {
        signIn();
    }
}

function button_sendMessage() {
    var chatString = chatMessageTextID.value;
    if (chatString.length > 0) {
        chatWebSocket.send("ctmsg" + currentUsername + ":" + chatString);
        chatMessageTextID.value = "";
    }
}

function refreshForSignInOut() {
    var newTitle = "Chat";
    if (isSignedIn()) {
        newTitle = newTitle + " " + currentUsername;
        SendButtonID.disabled = false;
        chatMessageTextID.disabled = false;
        SignInButtonID.value = "Sign out";
    } else {
        SendButtonID.disabled = true;
        chatMessageTextID.disabled = true;
        SignInButtonID.value = "Sign in";
        transcriptID.textContent = "";
        userListID.textContent = "";
    }
    var titleNode = document.getElementById("titleID");
    titleNode.textContent = newTitle;
}

function writeTranscript(str)  {
    var index = str.search(":");
    var currentUsername = str.substring(0, index);
    var message = str.substring(index+1, str.length);
    transcriptID.textContent = transcriptID.textContent + "\n" + currentUsername + "> " + message;
}

function writeUserlist(rawStr) {

    var remaining = rawStr;
    var usernames = [];
    while (remaining.search(":") !== -1) {
        var index = remaining.search(":");
        var nextPiece = remaining.substring(0, index);
        usernames.push(nextPiece);
        remaining = remaining.substring(index + 1, remaining.length);
    }
    usernames.push(remaining);
    userListID.textContent = "";

    for (var i = 0; i < usernames.length; i++) {
        userListID.textContent = userListID.textContent + usernames[i];
        if (i < (usernames.length - 1)) {
            userListID.textContent = userListID.textContent + "\n";
        }
    }
}

function goodbye() {
    chatWebSocket.close();
}

window.addEventListener("load", init, false);
window.addEventListener("beforeunload", goodbye, false);


