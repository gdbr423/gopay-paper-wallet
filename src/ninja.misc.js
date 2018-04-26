(function (ninja) {
	var status = ninja.status = function() {
		var cryptoCase = "";
		if (window.crypto && window.crypto.getRandomValues) {
			cryptoCase = "good";
		}
		else {
			cryptoCase = "bad";
		}

		var protocolCase = "";
		switch (window.location.protocol) {
			case 'file:':
				protocolCase = "good";
				break;
			case 'http:':
			case 'https:':
				protocolCase = "bad";
				break;
			default:
		}

		var showCrypto = function () {
			document.getElementById('statuscrypto' + cryptoCase).style.display = 'block';
		};

		var showProtocol = function () {
		};


		var showKeyPool = function () {
			document.getElementById('statuskeypoolgood').style.display = 'block';
			document.getElementById("keypooltextarea").value = Bitcoin.KeyPool.toString();
		};

		return null;
	}();
})(ninja);

ninja.tab = {
    select: function (walletTab) {
        // detect type: normally an HtmlElement/object but when string then get the element
        if (typeof walletTab === 'string') {
            walletTab = document.getElementById(walletTab);
        }
        var walletType = walletTab.getAttribute("id");

        if (walletTab.className.indexOf("selected") == -1) {
            // unselect all tabs
            for (var wType in ninja.wallets) {
                document.getElementById(wType).className = "tab";
                ninja.wallets[wType].close();
            }
            
            // don't open tab if entropy still being collected
            // exceptions: brainwallet detailwallet
            if (ninja.seeder.isStillSeeding == false || walletType == "brainwallet" || walletType == "detailwallet") {
				walletTab.className += " selected";
				// var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
				
				// if($){
				// 	$('#generate').addClass('animated zoomOut').one(transitionEnd, function(){
				// 		document.getElementById("generate").style.display = "none";
				// 		ninja.wallets[walletTab.getAttribute("id")].open();
				// 	});;	
				// } else {
				// 	document.getElementById("generate").style.display = "none";
				// 	ninja.wallets[walletTab.getAttribute("id")].open();
				// }

				document.getElementById("generate").style.display = "none";
				ninja.wallets[walletTab.getAttribute("id")].open();
            }
            else if (ninja.seeder.isStillSeeding == true && !(walletType == "brainwallet" || walletType == "detailwallet")) {
                document.getElementById("generate").style.display = "block";
            }
        }
    },

    whichIsOpen: function () {
        var isOpen;
        for (var wType in ninja.wallets) {
            isOpen = ninja.wallets[wType].isOpen();
            if (isOpen) {
                return wType;
            }
        }
        return null;
    }

};

ninja.getQueryString = function () {
	var result = {}, queryString = location.search.substring(1), re = /([^&=]+)=([^&]*)/g, m;
	while (m = re.exec(queryString)) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	return result;
};

// use when passing an Array of Functions
ninja.runSerialized = function (functions, onComplete) {
	onComplete = onComplete || function () { };

	if (functions.length === 0) onComplete();
	else {
		// run the first function, and make it call this
		// function when finished with the rest of the list
		var f = functions.shift();
		f(function () { ninja.runSerialized(functions, onComplete); });
	}
};

ninja.forSerialized = function (initial, max, whatToDo, onComplete) {
	onComplete = onComplete || function () { };

	if (initial === max) { onComplete(); }
	else {
		// same idea as runSerialized
		whatToDo(initial, function () { ninja.forSerialized(++initial, max, whatToDo, onComplete); });
	}
};

// use when passing an Object (dictionary) of Functions
ninja.foreachSerialized = function (collection, whatToDo, onComplete) {
	var keys = [];
	for (var name in collection) {
		keys.push(name);
	}
	ninja.forSerialized(0, keys.length, function (i, callback) {
		whatToDo(keys[i], callback);
	}, onComplete);
};