angular.module('starter.services', [])

.service('settings', function(){
    var self = this;
    self.OAuthRoot = 'https://oauth.apitest.cc.ncu.edu.tw/oauth/';
    
    self.clientID = '';
    self.redirectURI = 'https://140.115.3.104/sign/';
    self.scope = '';
    
    self.OAuthConsole = self.OAuthRoot + 'applications';
    self.OAuthEndPoint = self.OAuthRoot + 'authorize?client_id=' + self.clientID + 
                        '&redirect_uri=' + self.redirectURI + 
                        '&response_type=token&scope=' + self.scope;
                        
})

.service('signAPI', function($http){
    var self = this;
	self.rootURL = 'https://apitest.cc.ncu.edu.tw/signin/v1/';
    self.events = {"content":[]};
    self.pageGot = 0;
    self.lastCheck = 0;
    
    self.signIns = {};
    
    self.getEvents = function(accessToken, callback, ERRcallback){
        req = {
            method: 'GET',
            url: self.rootURL + 'activities',
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Bearer ' + accessToken
            },
            params: {
                'page': self.pageGot
            }
        }        
        
        if(self.events.pageMetadata === undefined){
            self.pageGot = 0;
        }
        req.params.page = self.pageGot;
                
        $http(req).then(function(resp){
            self.lastCheck = Date.now();
            if(self.events.pageMetadata !== undefined){
                if(resp.data.pageMetadata.totalPages > self.events.pageMetadata.totalPages){
                    self.events.pageMetadata = resp.data.pageMetadata;
                }
            }else{
                self.events.pageMetadata = resp.data.pageMetadata;
            }
            if(resp.data.content.length>0){
                for(i=0;i<resp.data.content.length;i++){
                    self.events.content.push(resp.data.content[i]);
                }
                self.pageGot = self.pageGot + 1;
            }
            if(typeof(callback) === 'function'){
                callback();
            }
        }, function(err){
            console.error('ERR', err);
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
        });    
    }
    
    self.moreEventsToGet = function(){
        if(self.events.pageMetadata === undefined){
            return true;
        }
        if(self.pageGot < self.events.pageMetadata.totalPages || Date.now() - self.lastCheck > 60*1000){
            return true;
        }
        return false;
    }
    
    self.refreshEventList = function(accessToken, callback, ERRcallback){
        //clear old data
        //self.events.clear();
        self.events = {"content":[]};
        self.pageGot = 0;
        self.lastCheck = 0;
        self.signIns = {};
        
        req = {
            method: 'GET',
            url: self.rootURL + 'activities',
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Bearer ' + accessToken
            },
            params: {
                'page': self.pageGot
            }
        }        
        
        req.params.page = self.pageGot;
                
        $http(req).then(function(resp){
            self.lastCheck = Date.now();
            self.events.pageMetadata = resp.data.pageMetadata;
            if(resp.data.content.length>0){
                for(i=0;i<resp.data.content.length;i++){
                    self.events.content.push(resp.data.content[i]);
                }
                self.pageGot = self.pageGot + 1;
            }
            if(typeof(callback) === 'function'){
                callback();
            }
        }, function(err){
            console.error('ERR', err);
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
        });    
    }
    
    self.getEvent = function(accessToken, eventID, callback, ERRcallback){
        req = {
            method: 'GET',
            url: self.rootURL + 'activities/' + eventID,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Bearer ' + accessToken
            }
        }        
        
        $http(req).then(function(resp){
            if(typeof(callback) === 'function'){
                callback(resp);
            } 
        }, function(err){
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
            console.error('ERR', err);
        });    
        
    }
    
    self.addEvent = function(accessToken, evnt, callback, ERRcallback){
        dataStr = JSON.stringify(evnt)
        req = {
            method: 'POST',
            url: self.rootURL + 'activities',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            data: JSON.stringify(evnt)
        }     
        
        $http(req).then(function(resp){
            self.events = {"content":[], "pageMetadata":{} };
            self.pageGot = 0;
            self.getEvents(accessToken, callback);
        }, function(err){
            console.error('ERR', err);
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
        });
    }
    
    self.updateEvent = function(accessToken, evnt, callback, ERRcallback){
        dataStr = JSON.stringify(evnt)
        req = {
            method: 'PUT',
            url: self.rootURL + 'activities',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            data: JSON.stringify(evnt)
        }     
        req.url = self.rootURL + 'activities/' + evnt.id;
        
        $http(req).then(function(resp){
            self.events = {"content":[], "pageMetadata":{} };
            self.pageGot = 0;
            self.getEvents(accessToken, callback);
        }, function(err){
            console.error('ERR', err);
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
        });
    }
    
    self.delEvents = function(accessToken, eventIDs, callback, ERRcallback){
        req = {
            method: 'DELETE',
            url: self.rootURL + 'activities/',
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Bearer ' + accessToken
            },
        }     
        
        for(i=0;i<eventIDs.length-1;i++){
            req.url = self.rootURL + 'activities/' + eventIDs[i];
            $http(req).then(function(resp){
            }, function(err){
                console.error('ERR', err);
            });
        }
        
        req.url = self.rootURL + 'activities/' + eventIDs[eventIDs.length-1];
        $http(req).then(function(resp){
            self.events.content = [];
            self.events.pageMetadata = {};
            self.pageGot = 0;
            self.getEvents(accessToken, callback);
        }, function(err){
            console.error('ERR', err);
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
        });
    }
    
    self.moreSignInsToGet = function(eventID){
        if(self.signIns[eventID] === undefined){
            return true;
        }
        if(self.signIns[eventID].pageGot < self.signIns[eventID].pageMetadata.totalPages 
        || Date.now() - self.signIns[eventID].lastCheck > 60*1000){
            return true;
        }
        return false;
    }
    
    self.getSignIn = function(accessToken, eventID, callback, ERRcallback){
        page = 0;
        if(self.signIns[eventID] === undefined){
            page = 0;
        }else{
            page = self.signIns[eventID].pageGot;
            //if(self.signIns[eventID].pageMetadata.pageGot +1 >= 
            //    self.signIns[eventID].pageMetadata.totalPages){
            //}else{
            //    page = self.signIns[eventID].pageMetadata.pageGot + 1;
            //}
        }
        
        req = {
            method: 'GET',
            url: self.rootURL + 'activities/' + eventID + '/sign_in',
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Bearer ' + accessToken
            },
            params: {
                'page': page
            }
        }             
        
        $http(req).then(function(resp){            
            if(self.signIns[eventID] === undefined){
                self.signIns[eventID] = resp.data
                self.signIns[eventID].pageGot = page+1;    
            }else{
                for(i=0;i<resp.data.content.length;i++){
                    self.signIns[eventID].content.push(resp.data.content[i]);
                }
                self.signIns[eventID].pageMetadata= 
                    self.signIns[eventID].pageMetadata;
                if(resp.data.content.length>0){
                    self.signIns[eventID].pageGot = page+1;
                }else{
                    self.signIns[eventID].pageGot = page;
                }
            }
            self.signIns[eventID].lastCheck = Date.now();
            callback();
        }, function(err){
            console.error('ERR', err);
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
        });
    }
    
    self.addSignIn = function(accessToken, eventID, userID, callback, ERRcallbac){
        dataStr = JSON.stringify( {'userId':userID} );
        req = {
            method: 'POST',
            url: self.rootURL + 'activities/' + eventID + '/sign_in',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            data: dataStr
        }     
        
        $http(req).then(function(resp){
            self.signIns[eventID] = undefined;
            callback(resp)
        }, function(err){
            console.error('ERR', err);
            if(typeof(ERRcallback) === 'function'){
                ERRcallback(err);
            }
        });
    }
    
    self.formatDate = function(date){
        phDate = new Date(date);
        phDateStr = phDate.getFullYear() + '/' +
            (phDate.getMonth()+1) + '/' + phDate.getDate() + ' ' +
            (phDate.getHours()<10?'0':'') + phDate.getHours() + ":" + 
            (phDate.getMinutes()<10?'0':'') + phDate.getMinutes() + ":" +
            (phDate.getSeconds()<10?'0':'') + phDate.getSeconds() ;
        return phDateStr;
    }
});