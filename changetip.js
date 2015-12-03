CHANGETIP_ICON_HTML = "<img id='changetip-tip-section-img' style='cursor:pointer' src='https://cdn.changetip.com/img/logos/changetip_round_icon.png'/>"

if(urlContains("soundcloud.com") || urlContains("www.youtube.com")) { //include jQuery
    var script = document.createElement('script');
    script.src = chrome.extension.getURL('jquery.min.js');
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
}

$( document ).ready(function() {
        
    if(urlContains("twitter.com")) {

        $(".ProfileTweet-action--favorite").each(function() { //add tip button to tweets
            $(this).after( '<div class="ProfileTweet-action"> <button class="ProfileTweet-actionButton u-textUserColorHover js-actionButton js-actionReply changetip-tip-sendtip" type="button"> <div class="IconContainer js-tooltip" title="Tip"><img src="' +  chrome.extension.getURL('img/dollar_sign.png') + '" class="changetip-tip-icon" ></img></button></div>' );

            $(".changetip-tip-icon")
                .mouseover(function() { 
                    var src = chrome.extension.getURL('img/dollar_sign_hover.png')
                    $(this).attr("src", src);
                })
                .mouseout(function() {
                    var src = chrome.extension.getURL('img/dollar_sign.png')
                    $(this).attr("src", src);
                });
          });

        $(".changetip-tip-sendtip").each(function () {

            $(this).click(function() {
                setTimeout( //tempory method to wait until animation completes
                    function() {
                        $("#tweet-box-template div").before("@Changetip, send ");
                        chrome.storage.sync.get({
                            defaultTipAmount: '$1'
                          }, function(items) {
                            $("#tweet-box-template div").append(items.defaultTipAmount);
                        });
                    },
                100);
            });
        });

        //add changetip tip button on user's profiles

        $("body").append("<div id='changetip-tip-section'>" + CHANGETIP_ICON_HTML + "</div>");

        document.getElementById("changetip-tip-section-img").addEventListener("click", composeTweet);

    } else if(urlContains("www.reddit.com")) {
        $(".reply-button").each(function() {
            $(this).after( '<li class="tip-button"><a class="access-required" href="javascript:void(0)" onclick="return reply(this)">tip</a></li>' );
          });

        $(".tip-button").each(function () {
            $(this).click(function() {
                addRedditTip(this);
            });
        });
    } else if(urlContains("soundcloud.com")) {
        $(".sc-button-group .sc-button-like").each(function() {
            $(this).after('<button class="sc-button-tip sc-button sc-button-medium sc-button-responsive" tabindex="0" aria-haspopup="true" role="button" aria-owns="dropdown-button-95" title="Tip"><div class="soundcloud-container-div"><img style="float:left;" class="changetip-tip-icon chnagetip-tip-icon-soundcloud" src="' + chrome.extension.getURL('img/dollar_sign_soundcloud.png') + '"/><span style="float:right;"> Tip</span></div></button>');
          });

        $(".sc-button-tip").each(function () {
            $(this).width("50px");
            $(this).click(function() {
                chrome.storage.sync.get({
                    defaultTipAmount: '$1'
                  }, function(items) {

                    $(".commentForm__inputWrapper input")[0].focus();
                    $(".commentForm__inputWrapper input").each(function() {$(this).attr("value", "@Changetip, send " + items.defaultTipAmount + "!")})
                });
            });
        });
        
    } else if(urlContains("slack.com")) {
        $(".ts_icon_add_reaction").each(function() {
            $(this).after('<a class="ts_icon ts_tip ts_tip_top ts_tip_float ts_tip_delay_600 ts_tip_hidden changetip-tip-button">$<span class="ts_tip_tip">Tip</span></a>');
        })

        $(".changetip-tip-button").each(function() {
            $(this).click(function() {
                addSlackTip(this);
            });
        });
    }

});


function addRedditTip(button) {
    var username = $(button).closest(".entry").find(".author").text()
    chrome.storage.sync.get({
        defaultTipAmount: '$1'
      }, function(items) {
        $(button).closest(".thing").find("textarea").val("/u/Changetip, send /u/" + username + " " + items.defaultTipAmount + "!");
    });
}

function addSlackTip(button) {
    var username = $(button).closest(".message").find(".message_sender").text()
    chrome.storage.sync.get({
        defaultTipAmount: '$1'
      }, function(items) {

        $("#message-input").focus();
        $("#message-input").val("Changetip, send @" + username + " " + items.defaultTipAmount + "!");
    });
}

function composeTweet() {
    $( "#changetip-tip-section" ).animate({
      height: "250px",
      width: "500px"
    });

    twitterUser = location.pathname.split('/')[1];

    chrome.storage.sync.get({
        defaultTipAmount: '$1'
      }, function(items) {
        
        $("<div class='form-holder'><textarea id='changetip-tip-section-text'>@Changetip, send @" + twitterUser + " " + items.defaultTipAmount + "!</textarea><input type='submit' id='changetip-tip-section-post' value='Tweet'></input></div>").appendTo('#changetip-tip-section');

        document.getElementById("changetip-tip-section-post").addEventListener("click", postTweet);

    });

    document.getElementById("changetip-tip-section-img").removeEventListener('click', composeTweet);
    document.getElementById("changetip-tip-section-img").addEventListener("click", minimizeTweet);
        
}

function minimizeTweet() {
    $( "#changetip-tip-section" ).animate({
      height: "65px",
      width: "65px"
    });

    $("#changetip-tip-section").html(CHANGETIP_ICON_HTML);
    document.getElementById("changetip-tip-section-img").removeEventListener('click', minimizeTweet);
    document.getElementById("changetip-tip-section-img").addEventListener("click", composeTweet);
}

function postTweet() {
    newwindow=window.open("https://twitter.com/intent/tweet?text=" + $("#changetip-tip-section-text").val(),'name','height=300,width=300');
    if (window.focus) {newwindow.focus()}
    
}

function urlContains(searchString) {
    return window.location.host.indexOf(searchString) > -1
}
