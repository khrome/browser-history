browser-history.js
==============
An AMD/commonjs utility for interacting with browser histories and generating new ones.

    require(['browser-history'], function(History){
    
    });

History Objects
---------------
Declare a new [History](https://developer.mozilla.org/en-US/docs/Web/API/History) object 

    var myHistory = new History();
    
add a new state onto the stack

    myHistory.pushState(state, title, location);
    
replace the current state on the stack with the new state
    
    myHistory.replaceState(state, title, location);
    
move through the history by the specified offset
    
    myHistory.go(offset);
    
move forward in the history stack by one

    myHistory.forward();

move back in the history stack by one

    myHistory.back();
    
monitor the object for popstate events

    myHistory.events.on('popstate', function(state){
        //do stuff
    });
    
Attaching to the Browser
------------------------

Part of working with the browser on single page apps often involves manually generating states and differentiating between state events you created, ones the user initiates from pressing the back buttons and the ones they create by manually editing the hash. That's where this comes in.

    var browserHistory = history.attachToBrowser($(window), {
        serialize : function(state){
            //take a state and return a location.hash
        },
        deserialize : function(location.hash){
            //  turn hash into a state and return it
            // the default is to break the hash into name/value ...
            // with the first 'name' being set as the 'view'
            // so if our location is #user/inigo/history/paternal 
            // the state is:
            // {
            //     view : 'user',
            //     user : 'inigo',
            //     history : 'paternal'
            // }
        },
        reconstitute : function(state){
            //alter the browser to reflect the incoming state
        }
    });
    
then when you are browsing around, to create a new history event just call:

    browserHistory.next(state);
    
or to replace the existing history event with a new state
    
    browserHistory.instead(state);
    
sometimes you need to mark a place in history for later return:

    browserHistory.mark(label);
    
then you'll need to actually return:

    browserHistory.rewind(label);
    
or sometimes you just need to find a previous state:

    browserHistory.search(view, query);

Testing
-------

Run the tests at the project root with:

    mocha

Enjoy,

-Abbey Hawk Sparrow