// Saves options to chrome.storage
function save_options() {
  var defaultTipAmount = document.getElementById('default').value;
  chrome.storage.sync.set({
    defaultTipAmount: defaultTipAmount
  }, function() {
    // Update status to let user know options were saved.
    $("#status").text('Options saved.')
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

  balance("btc", function(response){
    $("#balance").text("$" + response.balance_user_currency)
    chrome.storage.sync.set({userBalance: "$" + response.balance_user_currency})
  })

  chrome.storage.sync.get({
    defaultTipAmount: '$1',
    userBalance: 'Connect Changetip to view your balance.'
  }, function(items) {
    $('#default').val(items.defaultTipAmount);
    $("#balance").text( items.userBalance)
  });
}

function login() {
  clientID = "cCltdULVBLeKQuKPZYk2o8vKBHiB4lLakVjTmAm1"
  clientSecret = "lNFK5AKAoFh3IhffcYuokr5NuoNPDHg1DdMevRxsPJyI7koIlEs8dNS0MJfqgR80VK16yHGh2pfNXummPhJvAmmCUobxpTZMU3COE5ez422wLNnoOPKhn80T2R0LeVQe"
  redirectURI = "https://kilamjbihkhhjnaehgbgcofecoiccgba.chromiumapp.org/changetip"
  scope = "read_user_basic read_user_full send_my_tips_all_channels read_all_balances_all_users"
  var url = getOAUTHURL()
  chrome.identity.launchWebAuthFlow(
  {'url': url, 'interactive': true},
  function(redirect_url) {
    exchangeToken(extractToken(redirect_url), function(data) {
      setTokens(data.access_token, data.refresh_token, function() {
        $("#status").text('Successfully logged in via Changetip.')
      })
    })
  });
}

function launchLogin() {
  chrome.tabs.create({ url: "options.html?connect=true" });
}

function options() {
  chrome.tabs.create({ url: "options.html" });
}

function shareToTipworthy() {
  $("#dialog-form").dialog( "open" );
  chrome.tabs.getSelected(null, function(tab) {
      $("#title").val(tab.title)
      $("#url").val(tab.url)
  });
  $('html').animate({"width":"400px", "height":"400px"}, 300);
}

$(window).load(function() {
  restore_options();

  dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 400,
      width: 400,
      modal: true,
      buttons: {
        "Post": function(){
          postTipworthy($("#title").val(), $("#url").val(), $("#recipient").val(), $("#recipient_channel").val(), $("#amount").val(), function() {
            dialog.dialog("close")
            $("status").text("Successfully posted!")
          })
        },
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        $('html').animate({"width":"170px", "height":"250px"}, 150);
      }
    });
})

var queryDict = {}
location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
if(queryDict.connect == "true") login()

$("#save").click(save_options)
$("#login").click(login)
$("#launch").click(launchLogin)
$("#tipworthy").click(shareToTipworthy)
$("#options").click(options)