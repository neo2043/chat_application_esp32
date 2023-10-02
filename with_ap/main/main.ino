// ----------------------------------------------------------------------------
//library included here
// ----------------------------------------------------------------------------

#include <Arduino.h>
#include <SPIFFS.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include "includes/staticArray.hpp"



// ----------------------------------------------------------------------------
//stuff defined here
// ----------------------------------------------------------------------------

//wifi cred defined here
#include "passwd/password.h"

#define HTTP_PORT 80
const char* PARAM_INPUT_1 = "name";
staticStringArray clientIPArray;
staticStringArray nameArray;
staticIntArray clientIDArray;

//server defined here

AsyncWebServer server(HTTP_PORT);
AsyncWebSocket ws("/ws");

// ----------------------------------------------------------------------------
//function for spiffs system initialization
// ----------------------------------------------------------------------------

void initSPIFFS() {
  if (!SPIFFS.begin()) {
    while (1) {
      Serial.println("Cannot mount SPIFFS volume...");
    }
  }
}

// ----------------------------------------------------------------------------
//function for wifi initialization
// ----------------------------------------------------------------------------

void initWiFi() {
  WiFi.mode(WIFI_AP);
  if(!WiFi.softAP(WIFI_SSID,WIFI_PASS)) {
    Serial.print("error starting the AP");
    while(1);
  }
  Serial.print("The IP of the created AP is: ");
  Serial.println(WiFi.softAPIP());
}

// ----------------------------------------------------------------------------
// function if any message recieved from the client through websocket
// ----------------------------------------------------------------------------

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
    AwsFrameInfo *info = (AwsFrameInfo*)arg;
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
        DynamicJsonDocument json(1024);
        int toClientID;
        DeserializationError err = deserializeJson(json, data);
        if (err) {
            Serial.print(F("deserializeJson() failed with code "));
            Serial.println(err.c_str());
            return;
        }
        if(json["contentType"]=="message"){
            const char *recipient=json["reciever"];
            toClientID=clientIDArray.atIndex(nameArray.indexOf(recipient));
        }
        char redirectData[1024];
        size_t len=serializeJson(json,redirectData);
        ws.text(toClientID,redirectData,len);
    }
}

// // ----------------------------------------------------------------------------
// // function to handle any client connected to websocket
// // ----------------------------------------------------------------------------

void newClientConnect(int clientID){
    DynamicJsonDocument json(128);
    char data[128];
    String name=nameArray.atIndex(clientIDArray.indexOf(clientID));
    Serial.printf("new client name: %s",name);
    json["contentType"]="newClientConnect";
    json["name"]=name;
    size_t len=serializeJson(json, data);
    ws.textAll(data,len);
}

void clientDisconnect(int clientID){
    int clientIndex=clientIDArray.indexOf(clientID);
    Serial.printf("client index: %d\n",clientIndex);
    String name=nameArray.atIndex(clientIndex);
    Serial.printf("name at client index: %s\n",name);
    DynamicJsonDocument json(128);
    char data[128];
    json["contentType"]="clientDisconnect";
    json["name"]=name;
    size_t len=serializeJson(json, data);
    ws.textAll(data,len);
    Serial.println("client array before");
    clientIDArray.printArray();
    clientIDArray.removeByIndex(clientIndex);
    Serial.println("client array after");
    clientIDArray.printArray();
    Serial.println("name array before");
    nameArray.printArray();
    nameArray.removeByIndex(clientIndex);
    Serial.println("name array after");
    nameArray.printArray();
}

// // ----------------------------------------------------------------------------
// // function to handle any event on the websocket
// // ----------------------------------------------------------------------------

void onEvent(AsyncWebSocket *server,AsyncWebSocketClient *client,AwsEventType type,void *arg,uint8_t *data,size_t len) {
    switch (type) {
        case WS_EVT_CONNECT:
            Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
            Serial.println("client array before");
            clientIDArray.printArray();
            clientIDArray.add(client->id());
            Serial.println("client array after");
            clientIDArray.printArray();
            newClientConnect(client->id());
            break;
        case WS_EVT_DISCONNECT:
            Serial.printf("WebSocket client #%u disconnected\n", client->id());
            clientDisconnect(client->id());
            break;
        case WS_EVT_DATA:
            handleWebSocketMessage(arg, data, len);
            break;
        case WS_EVT_PONG:
        case WS_EVT_ERROR:
            break;
    }
}

// // ----------------------------------------------------------------------------
// //function for websocket initialization
// // ----------------------------------------------------------------------------

void initWebSocket() {
    ws.onEvent(onEvent);
    server.addHandler(&ws);
}

// ----------------------------------------------------------------------------
//function for first request from the client
// ----------------------------------------------------------------------------

void onLoginPageRequest(AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/login.html", "text/html");
}

void clientName(AsyncWebServerRequest *request){
    String inputMessage;
    if(request->hasParam(PARAM_INPUT_1)){
        inputMessage = request->getParam(PARAM_INPUT_1)->value();
        Serial.println("nameArray before");
        nameArray.printArray();
        if(nameArray.contains(inputMessage)){
            request->send(200,"text/plain","nameNotValid");
        }
        else{
            nameArray.add(inputMessage);
            request->send(200,"text/plain","nameValid");
        }
        Serial.println("nameArray after");
        nameArray.printArray();
    }
    else{
        inputMessage = "No message sent";
    }
}

void nameList(AsyncWebServerRequest *request){
    DynamicJsonDocument json(512);
    JsonArray array = json.createNestedArray("nameList");
    char data[512];
    json["contentType"]="nameList";
    Serial.printf("size: %d\n",nameArray.size());
    for(int i=0;i<=nameArray.size();i++){
        Serial.printf("at index: %d %s\n",i,nameArray.atIndex(i));
        array.add(nameArray.atIndex(i));
    }
    serializeJson(json, data);
    request->send(200,"text/plain",String(data));
}

// ----------------------------------------------------------------------------
//function for initializing http server
// ----------------------------------------------------------------------------

void initWebServer() {
    server.on("/",HTTP_GET, onLoginPageRequest);
    server.on("/clientName", HTTP_GET, clientName);
    server.on("/nameList", HTTP_GET, nameList);
    server.serveStatic("/", SPIFFS, "/");
    server.begin();
}

// ----------------------------------------------------------------------------
//function for setup
// ----------------------------------------------------------------------------

void setup() {
    Serial.begin(115200); 
    delay(500);
    initSPIFFS();
    initWiFi();
    initWebSocket();
    initWebServer();
}

void loop() {

}
