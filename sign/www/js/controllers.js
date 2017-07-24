angular.module('starter.controllers', [])

.controller('eventsCtrl', function($scope, $ionicScrollDelegate, $ionicModal, $state, $ionicLoading, $ionicPopover, signAPI, settings) {   
    $scope.events = signAPI.events;
    
    // There's no item in list upon page load complete, thus triggering onInfinite()
    $scope.onInfinite = function(){
        if(signAPI.moreEventsToGet()){
            $ionicLoading.show({
                content: '正在取得活動列表',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            signAPI.getEvents(window.localStorage['access_token'], 
                function(){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $ionicLoading.hide();
                }, 
                function(err){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $ionicLoading.hide();
                    stateParams={};
                    j = JSON.stringify(stateParams);
                    document.cookie = "lastState=events;stateParams=" + j;
                    window.location=settings.OAuthEndPoint;
            });
        }else{
             $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    }
    
    $scope.doRefresh = function(){
        signAPI.refreshEventList(window.localStorage['access_token'], 
                function(){
                    // It is necessary to set length of events array to 0, 
                    // otherwise onInfinite() won't be triggered when UI scrolled to bottom,
                    $scope.events.length = 0;  
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.events = signAPI.events;
                }, 
                function(err){
                    $scope.$broadcast('scroll.refreshComplete');
                    stateParams={};
                    j = JSON.stringify(stateParams);
                    document.cookie = "lastState=events;stateParams=" + j;
                    window.location=settings.OAuthEndPoint;
            });
    }
    
    // Set colors of list items by adding class attribute to list items
    $scope.getEventClass = function(indx){
        if($scope.deleting){
            if($scope.deleteList.indexOf($scope.events.content[indx].id) != -1){
                return 'dark'
            }else{
                return ''
            }
        }else{
            if(indx%2 == 1){
                return 'dark'
            }else{
                return ''
            }
        }
    }
    
    // Set formatDate() function used by list items.
    $scope.formatDate = signAPI.formatDate;
	
    // Delete UI action:
    // Long click on list item to enter delete mode,
    // long click again or press '取消' button to exit delete mode.
    // select items to be deleted by clicking items in delete mode.
    // press '刪除' button to delete selected items.
    $scope.deleting = false; // A flag to indicate we're in delete mode or not
    $scope.deleteList = [];  // ID list of items to be deleted
	
    $scope.onEventClick = function(indx){
        if($scope.deleting){// if in delete mode
            idx = $scope.deleteList.indexOf($scope.events.content[indx].id)
            if(idx == -1){// if not been seleced in delet mode, add this event to delete list
                $scope.deleteList.push($scope.events.content[indx].id)
            }else{// if already added to delete list , remove this event from delete list
                $scope.deleteList.splice(idx, 1)
            }
        }else{// if not in delete mode, go to details page of the item
            $scope.goEvent(signAPI.events.content[indx].id)
        }
    }
    
    $scope.onEventLongClick = function(indx){
        if($scope.deleting){// if in delete mode, exit delete mode
            $scope.cancelDelete();
        }else{// If not in delete mode, enter delete mode and add long clicked item to delete list
            $scope.deleting = true
            $scope.deleteList.push($scope.events.content[indx].id)
        }
    };
    
    $scope.cancelDelete = function(){// Change mode flag and clear delete list
        $scope.deleting = false
        $scope.deleteList = []
    }
    
    $scope.Delete = function(){// Send out delete request and change mode flag 
        $scope.deleting = false
        signAPI.delEvents(window.localStorage['access_token'], $scope.deleteList, function(){
            $scope.deleteList = []
        });
    }
    
    // Page transfers
	$scope.goEvent = function(eID){
		$state.go('event', {eventID: eID});
	};

	$scope.goAdd = function(eID){
		$state.go('add');
	};
	
    // popover menu
    $ionicPopover.fromTemplateUrl('menu-popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
  
    $scope.openPopOver = function($event){
        $scope.popover.show($event);
    }
    
    $scope.logout = function(){
        window.localStorage.clear();
        $scope.popover.hide();
        $state.go('accessToken');
    }
    
    $scope.goToOAuthConsole = function(){
        window.location = settings.OAuthConsole;
    }
    
    
    // info Modal
	$ionicModal.fromTemplateUrl('info.html', function(modal) {
		$scope.infoModal = modal;
	}, {
		scope: $scope,
		animation: 'slide-in-up'
	});
	$scope.openInfoModal = function() {
		$scope.infoModal.show();
        $scope.events = signAPI.events;
	};
	$scope.closeInfoModal = function() {
		$scope.infoModal.hide();
	};
})

.controller('addEventCtrl', function($scope, $ionicHistory, $state, $ionicLoading, signAPI) {
    
    $scope.name = "活動名稱"
    phDateStr = signAPI.formatDate(new Date());
    $scope.date_started = phDateStr;
    $scope.date_ended = phDateStr;
    
    $scope.addEvent = function(name, date_started, date_ended){
        evnt = {};
        evnt.name = name;
        evnt.dateStarted = new Date(date_started).getTime();
        evnt.dateEnded = new Date(date_ended).getTime();
        if(name === ""){
            alert('請輸入活動名稱')
            return
        }
        if(isNaN(evnt.dateStarted) || isNaN(evnt.dateEnded)){
            alert('輸入時間格式不符')
            return
        }
        $ionicLoading.show({
                content: '正在創建活動',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        signAPI.addEvent(window.localStorage['access_token'], evnt, function(){
            $state.go('events');
            $ionicLoading.hide();
        }, function(err){
            $ionicLoading.hide();
            stateParams={};
            j = JSON.stringify(stateParams);
            document.cookie = "lastState=add;stateParams=" + j;
            window.location=settings.OAuthEndPoint;
        });
    };
    
    $scope.goBack = function(){
		$state.go('events');
	};
})

.controller('eventCtrl', function($scope, $state, $ionicHistory, $stateParams, $ionicLoading, $ionicModal, signAPI, settings) {
    
    
    $scope.evnt = undefined;
    for(i=0;i<signAPI.events.content.length;i++){
        if(signAPI.events.content[i].id === $stateParams.eventID){
            $scope.evnt = signAPI.events.content[i];
        }
    }
    if (typeof $scope.evnt == 'undefined'){
        $ionicLoading.show({
                content: '正在取得活動資料',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        signAPI.getEvent(window.localStorage['access_token'], $stateParams.eventID, function(resp){
            $scope.evnt = resp.data
            $scope.dateStarted = signAPI.formatDate($scope.evnt.dateStarted);
            $scope.dateEnded = signAPI.formatDate($scope.evnt.dateEnded);
            $scope.signRecordURl = signAPI.rootURL + 'activities/' + $scope.evnt.id + '/sign_in?page=0'
            $ionicLoading.hide();
        }, function(err){
            $ionicLoading.hide();
            stateParams={eventID: $stateParams.eventID};
            j = JSON.stringify(stateParams);
            document.cookie = "lastState=event;stateParams=" + j;
            window.location=settings.OAuthEndPoint;
        })
    }else{
        $scope.dateStarted = signAPI.formatDate($scope.evnt.dateStarted);
        $scope.dateEnded = signAPI.formatDate($scope.evnt.dateEnded);
        $scope.signRecordURl = signAPI.rootURL + 'activities/' + $scope.evnt.id + '/sign_in?page=0'
    }
    
    $scope.upDateEvent = function(name, dateStarted, dateEnded){
        evnt = {};
        evnt.id = $scope.evnt.id;
        evnt.name = name;
        evnt.dateStarted = new Date(dateStarted).getTime();
        evnt.dateEnded = new Date(dateEnded).getTime();
        if(evnt.name === ""){
            alert('請輸入活動名稱')
            return
        }
        if(isNaN(evnt.dateStarted) || isNaN(evnt.dateEnded)){
            alert('輸入時間格式不符')
            return
        }
        $ionicLoading.show({
                content: '正在取得更新活動資訊',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        signAPI.updateEvent(window.localStorage['access_token'], evnt, function(){
            $state.go('events');
            $ionicLoading.hide();
        }, function(err){
            $ionicLoading.hide();
            stateParams={eventID: $stateParams.eventID};
            j = JSON.stringify(stateParams);
            document.cookie = "lastState=event;stateParams=" + j;
            window.location=settings.OAuthEndPoint;
        });
    }
    
    $scope.delEvent = function(){
        $ionicLoading.show({
                content: '正在刪除活動',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        signAPI.delEvents(window.localStorage['access_token'], [$scope.evnt.id], function(){
            $state.go('events');
            $ionicLoading.hide();
        }, function(err){
            $ionicLoading.hide();
            stateParams={eventID: $stateParams.eventID};
            j = JSON.stringify(stateParams);
            document.cookie = "lastState=event;stateParams=" + j;
            window.location=settings.OAuthEndPoint;
        })
    }

    
    // Page transfers
	$scope.goBack = function(){
		$state.go('events');
	};
    
    $scope.goCheck = function(){
        $state.go('check', {eventID: $scope.evnt.id});
    }
    
    $scope.goSignIn = function() {
        if(navigator.userAgent.match(/Android/i)){
            callBack = settings.redirectURI + "#/appSignIn/" + $scope.evnt.id + "/{CODE}"
            callBack = encodeURIComponent(callBack);
            window.location = "http://zxing.appspot.com/scan?ret=" + callBack;
        }else{
            $state.go('signIn', {eventID: $scope.evnt.id});
        }
	};
    
    // Sign Record URL Modal
	$ionicModal.fromTemplateUrl('SignRecordURL.html', function(modal) {
		$scope.SignRecordURLmodal = modal;
	}, {
		scope: $scope,
		animation: 'slide-in-up'
	});
	$scope.openSignRecordURL = function() {
		$scope.SignRecordURLmodal.show();
	};
	$scope.closeSignRecordURL = function() {
		$scope.SignRecordURLmodal.hide();
	};
    
})



.controller('checkCtrl', function($scope, $state, $ionicHistory, $stateParams, $ionicLoading, signAPI) {
    $scope.signIns = signAPI.signIns;
    $scope.eventID = $stateParams.eventID;
    
    $scope.formatDate = signAPI.formatDate;
    
    $scope.onInfinite = function(){
        if(signAPI.moreSignInsToGet($scope.eventID)){
        
            $ionicLoading.show({
                content: '正在取得活動簽到名單',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            signAPI.getSignIn(window.localStorage['access_token'], $stateParams.eventID,
                function(){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $ionicLoading.hide();
            }, function(err){
                $ionicLoading.hide();
                stateParams={eventID: $stateParams.eventID};
                j = JSON.stringify(stateParams);
                document.cookie = "lastState=check;stateParams=" + j;
                window.location=settings.OAuthEndPoint;
        });
        
        }
    }
    
    // A function used by template to decide whether to show a empty list reminder or not
    $scope.showReminder = function(){
        if($scope.signIns[$scope.eventID] === undefined){
            return true;
        }else if($scope.signIns[$scope.eventID].content.length === 0){
            return true;
        }else{
            return false;
        }
    }
    
    // Page transfers
	$scope.goBack = function(){
		$state.go('event', {eventID: $scope.eventID});
	};
    	
})

.controller('signInCtrl', function($scope, $state, $ionicHistory, $ionicModal, $stateParams, $ionicLoading, signAPI, settings) {  
    $scope.evnt = undefined;
    for(i=0;i<signAPI.events.content.length;i++){
        if(signAPI.events.content[i].id === $stateParams.eventID){
            $scope.evnt = signAPI.events.content[i];
        }
    }
    if (typeof $scope.evnt == 'undefined'){
        $ionicLoading.show({
                content: '正在取得活動資料',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        signAPI.getEvent(window.localStorage['access_token'], $stateParams.eventID, function(resp){
            $scope.event = resp.data
            $ionicLoading.hide();
        }, function(err){
            $ionicLoading.hide();
            // show error message
        })
    }
    $scope.eventID = $stateParams.eventID;
    $scope.userID = $stateParams.userID;
    $scope.createDate = "";
    
    
    var resultCollector = Quagga.ResultCollector.create({
        capture: true,
        capacity: 20,
        //blacklist: [{code: "2167361334", format: "i2of5"}],
        filter: function(codeResult) {
            //console.log(codeResult);
            // only store results which match this constraint
            // e.g.: codeResult
            return true;
        }
    });
    
    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            constraints:{
                width: 800,
                height: 600,
                facingMode: "environment"
            },            
            target: document.querySelector('#video'),
            //singleChannel: true
        },
        decoder : {
            readers : [
						"code_128_reader", 
						"code_39_reader"
						],
			multiple: true
        },
        locator: {
                patchSize: "medium",
                halfSample: true
        },
        locate: true
        }, function(err) {
            if (err) {
                console.log(err);
                return
            }
            Quagga.registerResultCollector(resultCollector);
            Quagga.start();
    });
    
    Quagga.onDetected(function(result) {
        var code = result[0].codeResult.code;
        $scope.userID = code.substring(0,code.length-1);
        $scope.$apply();
        console.log($scope.userID)
    });
    
    $scope.Sign = function(){
        if($scope.userID === "" || $scope.userID === undefined){
            alert('簽到ID不可為空')
            return;
        }
        $ionicLoading.show({
                content: '正在簽到',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        signAPI.addSignIn(window.localStorage['access_token'], $stateParams.eventID,
        $scope.userID, function(resp){
            $scope.createDate = signAPI.formatDate(resp.data.dateCreated)
            $ionicLoading.hide();
            console.log($scope.createDate)
        }, function(err){
            $ionicLoading.hide();
        });
    };
    
    // Page transfers
	$scope.goBack = function(){
        Quagga.stop();
		$state.go('event', {eventID: $scope.eventID});
	};
    
    $scope.openAPP = function(eventID) {
        callBack = settings.redirectURI + "#/appSignIn/" + $scope.eventID + "/{CODE}"
        callBack = encodeURIComponent(callBack);
		window.location = "http://zxing.appspot.com/scan?ret=" + callBack;
        $scope.closeAPPModal();
	};
     
})

.controller('appSignInCtrl', function($scope, $state, $ionicHistory, $ionicModal, $stateParams, $ionicLoading, signAPI, settings) {
    $scope.title = "活動簽到"
    $scope.eventID = $stateParams.eventID;
    $scope.userID = $stateParams.CODE;
    $scope.createDate = "";
    
    $scope.Sign = function(){
        $ionicLoading.show({
                content: '正在簽到',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        signAPI.addSignIn(window.localStorage['access_token'], $stateParams.eventID,
        $scope.userID, function(resp){
            $scope.createDate = signAPI.formatDate(resp.data.dateCreated)
            $ionicLoading.hide();
            $scope.title = "已簽到"
        }, function(err){
            $ionicLoading.hide();
            stateParams={eventID: $stateParams.eventID, CODE: $stateParams.CODE};
            j = JSON.stringify(stateParams);
            document.cookie = "lastState=appSignIn;stateParams=" + j;
            window.location=settings.OAuthEndPoint;
        });
    };
    
    $scope.evnt = undefined;
    $ionicLoading.show({
                content: '正在取得活動資料',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
    signAPI.getEvent(window.localStorage['access_token'], $stateParams.eventID, function(resp){
            $scope.evnt = resp.data
            $scope.dateStarted = signAPI.formatDate($scope.evnt.dateStarted);
            $scope.dateEnded = signAPI.formatDate($scope.evnt.dateEnded);
            $ionicLoading.hide();
            $scope.Sign()
        }, function(err){
            $ionicLoading.hide();
            stateParams={eventID: $stateParams.eventID, CODE: $stateParams.CODE};
            j = JSON.stringify(stateParams);
            document.cookie = "lastState=appSignIn;stateParams=" + j;
            window.location=settings.OAuthEndPoint;
        })
    
    // Page transfers
    $scope.goToEvent = function(){
		$state.go('event', {eventID: $scope.eventID});
	};
    
    $scope.openAPP = function() {
        callBack = settings.redirectURI + "#/appSignIn/" + $stateParams.eventID + "/{CODE}"
        callBack = encodeURIComponent(callBack);
		window.location = "http://zxing.appspot.com/scan?ret=" + callBack;
	}; 
})

.controller('accessTokenCtrl', function($scope, $ionicHistory, $state, $stateParams, $ionicLoading, $ionicModal, settings) {
    
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2){
            return parts.pop().split(";").shift();
        } else{
            return "";
        }
    }
    
    // Show loading window
    $ionicLoading.show({
        content: '正在檢查授權狀態',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    
    $scope.login = function(){
       window.location = settings.OAuthEndPoint;
    };
    
    $scope.goToOAuthConsole = function(){
        window.open(settings.OAuthConsole, '_blank');
    }
    
    // Error Modal
	$ionicModal.fromTemplateUrl('authERR.html', function(modal) {
		$scope.authERRModal = modal;
	}, {
		scope: $scope,
		animation: 'slide-in-up'
	});
	$scope.openAuthERRModal = function() {
		$scope.authERRModal.show();
	};
    $scope.closeAuthErrModal = function(){
        $scope.authERRModal.hide();
    };
    $scope.reauthorize = function(eventID) {
        window.location = settings.OAuthEndPoint;
        $scope.closeAuthErrModal();
	};
    $scope.closeTab = function(){
        window.close();
    }
    
	// Check if Access Token in URL fragment, if it does, get access token from URL fragment
	if($stateParams.accessToken){
        try{
			resCols = $stateParams.accessToken.replace('#','').split('&')
			res = {};
			for(i=0;i<resCols.length;i++){
				res[resCols[i].split('=')[0]] = resCols[i].split('=')[1];
			}
			if(res['access_token'] != undefined && !isNaN(parseInt(res['expires_in']))){
				window.localStorage.setItem("access_token", res['access_token']);
				expires_at = Math.floor(Date.now() / 1000) + parseInt(res['expires_in']) - 10;
				window.localStorage.setItem("expires_at", expires_at.toString());
			}
            $ionicLoading.hide();
            if(document.cookie === ""){
                $state.go('events');
            }else{
                if (getCookie("stateParams") !== ''){
                    $state.go(getCookie("lastState"), JSON.parse(getCookie("stateParams")) );
                }else{
                    $state.go(getCookie("lastState"));
                }
                
            }
            document.cookie = "";
            
		}catch(err){
            // Non Access Token string in URL fragment,
			// show authorization error dialog, redirect user to re-authorize
            console.log(err);
            $ionicLoading.hide();
            $scope.openAuthERRModal();
		}
        
	}
    $ionicLoading.hide();
    
	// Check if Access Token in local storage
	if(window.localStorage['access_token'] != null &&
		window.localStorage['expires_at'] != null){
		if(parseInt(window.localStorage['expires_at']) < Math.floor(Date.now() / 1000)){
            // Access Token expired
		}else{
            // Confirmed valid accessToken in local storage.
			$state.go('events');
		}
	}
})