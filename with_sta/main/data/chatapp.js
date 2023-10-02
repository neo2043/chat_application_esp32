var Name=localStorage.getItem("name");
document.querySelector("#client-name").innerText=Name;
var xhr = new XMLHttpRequest();
var websocket=new WebSocket(`ws://${window.location.hostname}/ws`);
var count=0;
var dict={};
var clientChatDataArray=[];
var activeChatRecipient='';

window.addEventListener("load",()=>{
    xhr.open("GET", "/nameList", true);
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200){
            let data = JSON.parse(xhr.response);
            if(data.contentType=="nameList"){
                var arr=data.nameList;
                for(var i=0;i<arr.length;i++){
                    if(Name==arr[i]){
                        continue;
                    }
                    addSidebarClientElement(arr[i]);
                }
            }
        }
    };
    xhr.send();
    initWebSocket();
});


document.querySelector("#send-button").addEventListener("click",clickSendMessage);
document.querySelector(".message-footer").querySelector("input").addEventListener("keypress",keyPressSendMessage);

function clickSendMessage(){
    if(activeChatRecipient==''){
        return;
    }
    var message=document.querySelector(".message-footer").querySelector("input").value;
    if(message==''){
        return;
    }
    document.querySelector(".message-footer").querySelector("input").value="";
    addChatSendMessage(message);
    handleOutGoingData(message);
    websocket.send(JSON.stringify({'contentType':'message','message':message,'sender':Name,'reciever':activeChatRecipient}));
}

function keyPressSendMessage(event){
    if(event.code!='Enter'){
        return;
    }
    if(activeChatRecipient==''){
        return;
    }
    var message=document.querySelector(".message-footer").querySelector("input").value;
    if(message==''){
        return;
    }
    document.querySelector(".message-footer").querySelector("input").value="";
    addChatSendMessage(message);
    handleOutGoingData(message);
    websocket.send(JSON.stringify({'contentType':'message','message':message,'sender':Name,'reciever':activeChatRecipient}));
}

function handleOutGoingData(message){
    for(var i=0;i<clientChatDataArray.length;i++){
        if(Object.keys(clientChatDataArray[i])[0]==activeChatRecipient){
            clientChatDataArray[i][activeChatRecipient]["messageCount"]+=1;
            clientChatDataArray[i][activeChatRecipient]["sent"][clientChatDataArray[i][activeChatRecipient]["messageCount"]]=message;
        }
    }
}

function addChatMessageFromArray(){
    for(var i=0;i<clientChatDataArray.length;i++){
        if(Object.keys(clientChatDataArray[i])[0]==activeChatRecipient){
            var run=clientChatDataArray[i][activeChatRecipient]["messageCount"];
            for(var j=1;j<=run;j++){
                var message=clientChatDataArray[i][activeChatRecipient]["recieved"][j];
                if(message!=undefined){
                    addChatRecieveMessage(message);
                }
                else{
                    var message=clientChatDataArray[i][activeChatRecipient]["sent"][j];
                    addChatSendMessage(message);
                }
            }
            return;
        }
    }
}

function clearMessageArea(){
    var arr=document.querySelectorAll(".chat-message");
    for(var i=0;i<arr.length;i++){
        arr[i].remove();
    }
}

function addChatSendMessage(message){
    var para=document.createElement("p");
    para.classList.add("chat-message");
    para.classList.add("chat-sent");
    para.innerText=message;
    document.querySelector(".message-content").appendChild(para);
}
function addChatRecieveMessage(message){
    var para=document.createElement("p");
    para.classList.add("chat-message");
    para.innerText=message;
    document.querySelector(".message-content").appendChild(para);
}

function addSidebarClientElement(name){
    for(var key in dict){
        if(name==dict[key]){
            return;
        }
    }
    count++;
    dict[count]=name;
    clientChatDataArray.push({[name]:{"messageCount":0,"recieved":{},"sent":{}}});
    var outerDiv = document.createElement("div");
    var innerDiv1 = document.createElement("div");
    var innerDiv2 = document.createElement("div");
    var innerDiv3 = document.createElement("div");
    var innerDiv1img=document.createElement("img");
    var innerDiv2h4=document.createElement("h4");
    outerDiv.classList.add("sidebar-chat");
    outerDiv.id="client-"+count;
    innerDiv1.classList.add("chat-avatar");
    innerDiv2.classList.add("chat-info");
    innerDiv3.id="alert-"+count;
    innerDiv1img.src="./assets/avatar.png";
    innerDiv2h4.innerText=name;
    innerDiv1.appendChild(innerDiv1img);
    innerDiv2.appendChild(innerDiv2h4);
    outerDiv.appendChild(innerDiv1);
    outerDiv.appendChild(innerDiv2);
    outerDiv.appendChild(innerDiv3);
    document.getElementById("sidebar-chats-id").appendChild(outerDiv);
    document.querySelector(`#client-${count}`).addEventListener("click",activeClientSelected);
}

function activeClientSelected(event){
    activeChatRecipient=event.target.textContent;
    for(var key in dict){
        if(dict[key]==activeChatRecipient){
            document.querySelector("#client-"+key).style.backgroundColor="#172554";
            document.querySelector("#title-name").innerText=activeChatRecipient;
            document.querySelector("#title-image").style.visibility="visible";
            document.querySelector(".message-footer").style.visibility="visible";
            if(document.querySelector("#alert-"+key).classList.contains("alert")){
                document.querySelector("#alert-"+key).classList.remove("alert");
            }
            clearMessageArea();
            addChatMessageFromArray();
        }
        else{
            document.querySelector("#client-"+key).style.backgroundColor="";
        }
    }
}

function removeSidebarClientElement(name){
    for(var key in dict) {
        if(name==dict[key]){
            document.querySelector("#client-"+key).remove();
            delete(dict[key]);
        }
    }
    for(var i=0;i<clientChatDataArray.length;i++){
        if(Object.keys(clientChatDataArray[i])[0]==name){
            clientChatDataArray.pop(i);
        }
    }
    activeChatRecipient='';
}

function incomingData(message,sender){
    for(var i=0;i<clientChatDataArray.length;i++){
        if(Object.keys(clientChatDataArray[i])[0]==sender){
            clientChatDataArray[i][sender]["messageCount"]+=1;
            clientChatDataArray[i][sender]["recieved"][clientChatDataArray[i][sender]["messageCount"]]=message;
        }
    }
    if(activeChatRecipient==sender){
        addChatRecieveMessage(message);
    }
    if(activeChatRecipient!=sender){
        for(var key in dict){
            if(sender==dict[key]){
                document.querySelector("#alert-"+key).classList.add("alert");
            }
        }
    }
}

// ----------------------------------------------------------------------------
// WebSocket handling
// ----------------------------------------------------------------------------

function initWebSocket() {
    console.log('Trying to open a WebSocket connection...');
    websocket.onopen    = onOpen;
    websocket.onclose   = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
    let data = JSON.parse(event.data);
    if(data.contentType=="newClientConnect"){
        addSidebarClientElement(data.name);
    }
    if(data.contentType=="clientDisconnect"){
        removeSidebarClientElement(data.name);
    }
    if(data.contentType=="message"){
        incomingData(data.message,data.sender);
    }
}

