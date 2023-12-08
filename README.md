# chat_application_esp32

## (this version of the project is single node meaning only one node of esp will work as station or ap)

this project's aim was to provide a communication method via an embedded board, i chose esp32 because of
it's community and already present examples code that i could use

this code can be opened in arduino ide directly or with some changes in platformio with arduino framework selected 

## versions

there are two versions of the code one with ap mode (with_ap) or access point mode where esp32 will make a wifi access point
for you so you have to provide ssid and password of your choice in that version's password.h file
and the other is with sta mode (with_sta) or station mode where esp32 will connect to a wifi access point so you have to 
provide wifi credentials according to that in password.h of that version

## dependencies

the dependencies for this project are some libraries that can't be downloaded from arduino library manager
so you have to download them, below is the like to the libraries

AsyncTCP           ->   https://github.com/me-no-dev/AsyncTCP  
ESPAsyncWebServer  ->   https://github.com/me-no-dev/ESPAsyncWebServer  
ESPAsyncTCP        ->   https://github.com/me-no-dev/ESPAsyncTCP           (optional)

## password.h

### before going over this part read versions

in the passwd directory there is a ex_password.h file, when using it you have to change the filename to "password.h"
and in it's content you have to add the ssid and password you want. 

#### to create this project i would like to give credit to steph for making my life easier

[Steph's µLab (Website)](https://m1cr0lab-esp32.github.io/remote-control-with-websocket/)  
[Steph's µLab (Github)](https://github.com/m1cr0lab)

#### if you have anymore ideas or have made any better changes or added new features please submit a pull request so that this project can be improved