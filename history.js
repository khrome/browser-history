/* generic history object  */

define(['emitter'], function(eventemitter) {
    var history = function(){
        this.stack = [];
        this.events = new eventemitter();
        this.position = -1;
        var ob = this;
        Object.defineProperty(this, "state", {
            get : function(){
                 return ob.stack[ob.position];
            },
            set : function(state){
                ob.stack.push(state);
                ob.position = ob.stack.length-1;
            },
            enumerable : true,
            configurable : true
        });
    };
    history.prototype.update = function(){
        if(this.onupdate) this.onupdate(this);
    };
    history.prototype.clipExcess = function(){
        if(this.position < this.stack.length-1){
            this.stack.splice(this.position+1);
            if(!this.stack.length) this.position = -1;
        }
    };
    history.prototype.pushState = function(state){
        this.clipExcess();
        this.stack.push(state);
        this.position++;
        this.update();
        this.events.emit('pushstate', this.state, state);
        this.events.emit('change', this.state, state);
    };
    history.prototype.popState = function(state){
        this.clipExcess();
        var result = this.stack.pop(state);
        this.position--;
        this.update();
        this.events.emit('popstate', this.state, state);
        this.events.emit('change', this.state, state);
        return result;
    };
    history.prototype.replaceState = function(state){
        this.clipExcess();
        this.stack[this.position] = state;
        this.update();
        this.events.emit('replacestate', this.state, state);
        this.events.emit('change', this.state, state);
    };
    history.prototype.go = function(steps){
        if(!steps) steps = 1;
        if(this.stack[this.position + steps]){
            this.position = this.position + steps;
            this.update();
            this.events.emit('go', steps, this.state);
            this.events.emit('change', this.state);
        }
    };
    history.prototype.current = function(name, value){
        if(this.stack[this.position]){
            if(name){
                if(value) this.stack[this.position][name] = value;
                else delete this.stack[this.position][name];
            }else return this.stack[this.position];
        }
    };
    history.prototype.back = function(){
        this.go(-1);
    };
    history.prototype.forward = function(){
        this.go(1);
    };
    history.attachToBrowser = function(target, options){
        if(!options) options = {};
        if(!options.synthesizeTiming) options.synthesizeTiming = 10;
        var state = {};
        var markers = {};
        var events = new eventemitter();
        var held = {};
        Object.defineProperties(state, { //add props to the object, but not to the data
            next : { value : function(changes){
                held.suppressUntil = (new Date()).getTime();
                
            }},
            //look for the last matching history
            //search
            previous : { value : function(view, conditions, current){
                
            }},
            instead : { value : function(changes){
                
            }},
            //mark
            save : { value : function(marker){
                 
            }},
            rewind : { value : function(marker){
                 
            }},
            stateFromURL : { value : function(url){
                //if()
                var state = {};
                if(options.appStateUnpack){
                    options.appStateUnpack(state);
                }else{
                    var hash = (
                    	url.indexOf('#') !== -1 ?
                    	url.substring(url.indexOf('#')):
                    	(
                    		url.indexOf('://') === -1 ?
                    		url:
                    		'' //url, with no hash
                    	)
                    );
                    if(hash[0] == '#') hash = hash.substring(1);
                    var target = false;
                    hash.split('/').forEach(function(field){
                        if(target){
                            if(!state.view) state.view = target;
                            state[target] = field;
                            target = false;
                        }else target = field;
                    });
                    events.emit.apply(events, ['state-parse', state]);
                }
                return state;
            }},
            on : {value:function(){ return events.on.apply(events, arguments); }},
            off : {value:function(){ return events.off.apply(events, arguments); }},
            once : {value:function(){ return events.once.apply(events, arguments); }},
            emit : {value:function(){ return events.emit.apply(events, arguments); }}
        });
        var lastHashChange = {time:(new Date()).getTime() - options.synthesizeTiming};
        /*target.on('popstate', function(e){
        	console.log('popstate', e.originalEvent.state);
            var newState = e.originalEvent.state;
            if(!newState) newState = state.stateFromURL(window.location.toString());
            console.log('state', newState);
            var time = (new Date()).getTime();
            setTimeout(function(){
            	console.log('popstate cb', window.location.toString());
            	console.log('??', lastHashChange.time, time);
            	if(lastHashChange.time < time) target.trigger('userhash', e);
            	else target.trigger('apphash', lastHashChange);
            }, options.synthesizeTiming);
        });
        
        target.on('userhash', function(e){
        	console.log('userhash', window.location.toString());
        });
        
        target.on('apphash', function(e){
        	console.log('apphash', window.location.toString());
        });
        
        target.on('hashchange', function(e){
        	console.log('hashchange', window.location.toString());
        	lastHashChange = e;
            e.time = (new Date()).getTime();
        });*/
        var flushHistoryEvents = function(){
        	var time = (new Date().getTime());
        	if(held.suppressUntil && held.suppressUntil > time){
        		held = {suppressUntil:held.suppressUntil};
        		return;
        	};
        	if(! (held.pop || held.change)) return;
        	console.log(held.changeTime - held.popTime, options.synthesizeTiming);
        	if(
        		held.popTime && 
        		held.changeTime && 
        		//* 
        		held.changeTime > held.popTime && 
        			held.changeTime - held.popTime < options.synthesizeTiming // only forward */
        		//Math.abs(held.popTime - held.changeTime) > options.synthesizeTiming // both directions
        	){
        		target.trigger($.extend(held.pop, {type : 'apphash'}));
        	}else{
        		if(held.pop) target.trigger($.extend(held.pop, {type : 'autopop'}));
        		if(held.change) target.trigger($.extend(held.change, {type : 'userhash'}));
        	}
        	held = {};
        }
        target.on('popstate', function(e){
        	e.originalEvent.appState = e.originalEvent.state || 
        		state.stateFromURL(window.location.toString());
        	e.appState = e.originalEvent.appState;
        	held.pop = e;
        	held.popTime = (new Date()).getTime();
        	setTimeout(flushHistoryEvents, options.synthesizeTiming);
        });
        
        target.on('hashchange', function(e){
        	held.change = e;
        	held.changeTime = (new Date()).getTime();
        	setTimeout(flushHistoryEvents, options.synthesizeTiming);
        });
        
        target.on('userhash', function(e){
        	console.log('userhash', e);
        });
        
        target.on('apphash', function(e){
        	console.log('apphash', e.appState);
        });
        return state;
    }
    return history;
});