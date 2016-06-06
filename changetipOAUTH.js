var clientID = ""
var clientSecret = ""
var redirectURI = ""
var scope = ""

function request(endpoint, method, parameters, complete, numErrors) {
  numErrors = typeof numErrors !== 'undefined' ? numErrors : 0; // default value of 0
  chrome.storage.sync.get({
    accessToken: '',
    refreshToken: ''
  }, function(items) {
 
  accessToken = items.accessToken
  refreshToken = items.refreshToken
  if(accessToken == "") return

  console.log("printing token: " + accessToken)

  var url = endpoint.indexOf('cancel') == 0 ? "https://changetip.com/" : "https://api.changetip.com/"

  $.ajax(
    url + endpoint,
    {
      type: method,
      dataType: 'json',
      data: jQuery.param(parameters),
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + accessToken)
      },
      complete: function(resp) {
        var responseText = JSON.parse(resp["responseText"]);
        console.log(JSON.stringify(responseText))
        //var username = responseText["username"]
        //console.log(username)
        //alert(responseText)
        //complete(responseText)
      },
      error: function(jqXHR, textStatus, errorThrown) { //try refresh token
        alert(errorThrown)
        if(refreshToken != "" && numErrors == 0) {
          refreshChangetipToken(refreshToken, function(data) {
            setTokens(data.access_token, data.refresh_token, function(){
              request(endpoint, method, parameters, complete, numErrors + 1)
            })
          })
        } else {
          console.log("error: " + textStatus)
        }
      }
    }
  );

  });
}

function me(completionHandler) {
  request("v2/me", "GET", "{}", function(response) {
    completionHandler(response)
  })
}

function balance(currency, completionHandler) {
  request("v2/pocket/" + currency + "/balance", "GET", "{}", function(response) {
    completionHandler(response)
  })
}

function transactions(completionHandler) {
  request("v2/transactions/", "GET", {channel: "app_iOSApp_0152cc61fac44c658c43f26b49723583"}, function(response) {
    completionHandler(response)
  })
}

function bitcoinToMBTC(value) {
  return value * 1000;
}

function mBTCToBTC(value) {
  return value / 1000;
}

function address(completionHandler) {
  request("v2/wallet/address/", "GET", "{}", function(response) {
    completionHandler(response)
  })
}

function withdraw(amount, address, completionHandler) {
  if(amount < .1) {
    alert("The minimum withdrawal amount is 0.1 mBTC.")
    return
  } else if(address == "") {
    alert("Please enter an address.")
    return
  }
  request("v2/pocket/withdrawals", "POST", {amount: mBTCToBTC(amount), address: address}, function(response) {
    completionHandler(response)
  })
}

function tipURL(amount, message, completionHandler) {
  var parameters = {
    amount: amount,
    message: message
  };
  request("v2/tip-url/", "POST", parameters, function(response) {
    completionHandler(response)
  })
}

function sendTip(receiver, channel, amount, message, completionHandler) {
  var parameters = {
    receiver: receiver,
    channel: channel,
    /*amount: amount,*/
    message: amount + message
  };
  request("v2/tip/", "POST", parameters, function(response) {
    completionHandler(response)
  })
}

function cancelTip(id) {
  console.log(id)
  request("cancel/" + id + "", "GET", {}, function(response) {
    completionHandler(response)
  })
}

function postTipworthy(title, url, recipient, recipient_channel, amount, completionHandler) {
  var parameters = {
    title: title,
    url: url,
    submission_url: url,
    canonical_url: url,
    recipient: recipient,
    recipient_channel: recipient_channel,
    amount: amount
  }
  request("v2/posts", "POST", parameters, function(response) {
    completionHandler(response)
  })
}

function extractToken(redirectURI) {
  return redirectURI.split('?')[1].split('=')[1]
}

function exchangeToken(token, completionHandler) {
  $.post( "https://www.changetip.com/o/token/", {client_id: clientID, client_secret: clientSecret, code: token, redirect_uri: redirectURI, grant_type: "authorization_code"}).done(function( data ) {
                  completionHandler(data)
                }).fail(function( data ) {
                  console.log("err: " + JSON.stringify(data))
                });
}

function refreshChangetipToken(refreshToken, completionHandler) {
  $.post( "https://www.changetip.com/o/token/", {client_id: clientID, client_secret: clientSecret, refresh_token: refreshToken, redirect_uri: redirectURI, grant_type: "refresh_token"}).done(function( data ) {
                  completionHandler(data)
                }).fail(function( data ) {
                  console.log("err: " + JSON.stringify(data))
                });
}

function setTokens(accessToken, refreshToken, completionHandler) {
  chrome.storage.sync.set({
    accessToken: accessToken,
    refreshToken: refreshToken
  }, function() {
    completionHandler();
  })
}

function getOAUTHURL() {
  return "https://www.changetip.com/o/authorize/?client_id=" + clientID + "&redirect_uri=" + redirectURI + "&scope=" + scope + "&approval_prompt=force&response_type=code&access_type=offline"
}
