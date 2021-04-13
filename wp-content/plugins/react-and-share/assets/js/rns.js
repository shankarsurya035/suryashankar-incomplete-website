(function($) {
  $(document).ready(function() {

    var baseUrl = "https://data.reactandshare.com/track.gif?id=" + rns_data.api_key;
    var pageViewSent = false;
    var wpUrl = rns_data.ajax_url;
    var reactions = ["like", "love", "happy", "surprised", "sad", "angry"];
    var startingTime;
    var timeout = 60000;
    var active = true;

    function Plugin(elem, posts) {
      var self = this;

      self.elem = elem;
      self.posts = posts;
      self.id = elem.data('postId');

      self.reactions = {};
      self.clickedReactions = [];
      
      // Check which reactions has been clicked
      $.each(posts, function(reaction, amount) {
        self.reactions[reaction] = amount
        if (Cookies.get('rns_reacted_' + reaction + '_' + self.id)) {
          self.clickedReactions.push(reaction);
        }
      });

      // Add clicked class
      self.elem.find('li')
        .filter(function() {
          var reaction = $(this).data('reaction');
          return isClicked(reaction);
        })
        .addClass('clicked');

      // Add reaction amounts
      self.elem.find('li').each(function() {
        var reaction = $(this).data('reaction');
        $(this).find('span').text(self.reactions[reaction]);
      });
      self.postUrl = self.elem.data('postUrl');
      self.separator = getSeparator(self.postUrl);
      self.fbShareUrl = encodeURIComponent(self.postUrl + self.separator + 'ref=rns_fb');
      self.twitterShareUrl = encodeURIComponent(self.postUrl + self.separator + 'ref=rns_tw');
      self.whatsappShareUrl = self.postUrl + self.separator + 'ref=rns_wa';
      self.pinterestShareUrl = encodeURIComponent(self.postUrl + self.separator + 'ref=rns_pi');
      self.linkedinShareUrl = encodeURIComponent(self.postUrl + self.separator + 'ref=rns_li');
      var featureImg = self.elem.data('postImg');
      var ogImg = document.querySelectorAll("meta[property='og:image']")[0] ? document.querySelectorAll("meta[property='og:image']")[0].content : '';
      self.pinterestShareImg = featureImg || ogImg;
      self.pinterestUrl = '?url=' + self.pinterestShareUrl;
      self.pinterestMedia = '&media=' + encodeURIComponent(self.pinterestShareImg);
      self.pinterestDesc = '&description=' + encodeURIComponent(self.elem.data('postTitle'));
      self.elem.find('.rns-pinterest-share').prop('href', 'https://pinterest.com/pin/create/button/' + self.pinterestUrl + self.pinterestMedia + self.pinterestDesc);
      self.elem.find('.rns-fb-share').prop('href', 'https://www.facebook.com/sharer/sharer.php?u=' + self.fbShareUrl);
      self.elem.find('.rns-twitter-share').prop('href', 'https://twitter.com/intent/tweet?url=' + self.twitterShareUrl);
      self.elem.find('.rns-whatsapp-share').prop('href', self.whatsappShareUrl);
      self.elem.find('.rns-linkedin-share').prop('href', 'https://www.linkedin.com/shareArticle?mini=true&url=' + self.linkedinShareUrl);

      if (self.elem.data('postSingle')) {
        startingTime = Date.now();
        new Idle({
          onHidden: function() { setReadingTime('hidden'); },
          onAway: function() { setReadingTime('away'); },
          onVisible: resetStartingTime,
          onAwayBack: resetStartingTime,
          awayTimeout: timeout
        }).start();
      
        $(window).on('unload', function() { setReadingTime('close'); });
      }

      function getSeparator(url) {
        var urlArray = url.split('/');
        if (urlArray[urlArray.length - 1].indexOf('?') === -1) {
          return '?';
        } 
        return '&';
      }

      function setReadingTime(trigger) {
        var now = Date.now();
        var readingTime = now - startingTime;
        if (active) {
          var readingTimeUrl = baseUrl;
          readingTimeUrl += '&a=time';
          readingTimeUrl += "&cu=" + encodeURIComponent(elem.data('postUrl'));
          readingTimeUrl += '&r=' + encodeURIComponent(document.referrer);;
          readingTimeUrl += '&rt=' + readingTime;
          readingTimeUrl += '&tr=' + trigger;
          sendPixel(readingTimeUrl);
          active = false;
        }
      }

      function resetStartingTime() {
        active = true;
        startingTime = Date.now();
      }

      function isClicked(reaction) {
        return self.clickedReactions.indexOf(reaction) !== -1;
      }

      function sendPageView() {
        if (!pageViewSent) {
        
          var dataUrl = baseUrl;
          dataUrl += "&a=pageload";
          dataUrl += "&r=" + encodeURIComponent(document.referrer);

          if (elem.data('postSingle')) {
            dataUrl += "&t=" + elem.data('postTitle');
            dataUrl += "&cu=" + encodeURIComponent(elem.data('postUrl'));
            dataUrl += "&ta=" + elem.data('postTags').replace('#', '%23');
            dataUrl += "&c=" + elem.data('postCategories');
            dataUrl += "&co=" + elem.data('postComments');
            dataUrl += "&l=" + self.reactions.like
            dataUrl += "&lo=" + self.reactions.love;
            dataUrl += "&j=" + self.reactions.happy;
            dataUrl += "&s=" + self.reactions.sad;
            dataUrl += "&su=" + self.reactions.surprised;
            dataUrl += "&an=" + self.reactions.angry;
            dataUrl += '&au=' + encodeURIComponent(elem.data('postAuthor'));
            dataUrl += '&pd=' + elem.data('postDate');
          }
          else {
            dataUrl += "&t=" + elem.data('postWpTitle')+ ' - Multiple posts';
            dataUrl += "&co=0";
            dataUrl += "&m=true";
          }
          
          dataUrl += "&rd=" + Date.now();
          sendPixel(dataUrl);
        }
        pageViewSent = true;

      }

      function sendPixel(dataUrl) {
        if (rns_data.api_key && rns_data.api_key.length > 0) {
          var img = new Image();
          img.src = dataUrl;
        }
      };

      function react(event) {
        event.preventDefault();
        var elem = $(this);
        var unreact = (elem.hasClass("clicked") ? true : false);
        var reaction = elem.data().reaction;
        $.post(wpUrl, { postid: self.id, action: 'rns_react', reaction: reaction, unreact: unreact }, function(data) {

        });
        var cookieKey = 'rns_reacted_' + reaction + '_' + self.id;
        if (unreact) {
          Cookies.remove(cookieKey);
        }
        else {
          Cookies.set(cookieKey, 'true', { expires: 30 });
        }

        elem.toggleClass("clicked");

        if (baseUrl) {
          var reactDataUrl = baseUrl + "&r=" + encodeURIComponent(document.referrer);
          reactDataUrl += "&a=reaction";
          reactDataUrl += "&cu=" + encodeURIComponent(self.elem.data('postUrl'));
          reactDataUrl += "&re=" + reaction;
          reactDataUrl += "&u=" + unreact;
          reactDataUrl += "&rd=" + Date.now();
          sendPixel(reactDataUrl);
        }

        var howMany = parseInt(elem.find('span').text());
        if (howMany > 0) {
          if (elem.hasClass("clicked")) {
            howMany += 1;
          } else {
            howMany -= 1;
          }
        } else {
          howMany = 1;
        }
        elem.find('span').text(howMany);

        elem.closest(".d_reactions").find(".d_reactions_shares").addClass("showshares");
      }

      function shareFb(e) {
        e.preventDefault();
        share("facebook", this);
        window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        return false;
      }

      function shareTwitter(e) {
        e.preventDefault();
        share("twitter", this);
        window.open($(this).attr('href'), 'twitterShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        return false;
      }

      function shareLinkedin(e) {
        e.preventDefault();
        share("linkedin", this);
        window.open($(this).attr('href'), 'linkedinShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        return false;
      }

      function sharePinterest(e) {
        e.preventDefault();
        share("pinterest", this);
        window.open($(this).attr('href'), 'twitterShareWindow', 'height=750, width=642, top=' + ($(window).height() / 2 - 375) + ', left=' + ($(window).width() / 2 - 400) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
        return false;
      }


      function shareWhatsApp(e) {
        e.preventDefault();
        var reactions = getClickedReactions(this);
        var length = reactions.length;
        var emoticons = {
          like: "👍",
          happy: "😂",
          love: "😍",
          sad: "😭",
          surprised: "😮",
          angry: "😡"
        };

        var sharedText = "";
        for (var i = 0; i < length; i++) {
          var reaction = $(reactions[i]).data("reaction");
          sharedText += emoticons[reaction];
        }
        var postUrl = $(this).attr('href');
        sharedText += " " + postUrl;

        var shareUrl = "whatsapp://send?text=" + encodeURIComponent(sharedText);
        share("whatsapp", this)
        window.location.href = shareUrl;
        return false;
      }

      function getClickedReactions(elem) {
        return $(elem).closest(".d_reactions").find(".clicked");
      }

      function share(dest, elem) {
        var reactions = getClickedReactions(elem);
        var length = reactions.length;
        var clickedReactions = [];
        for (var i = 0; i < length; i++) {
          var reaction = $(reactions[i]).data("reaction");
          clickedReactions.push(reaction);
        }

        var shareDataUrl = baseUrl + "&r=" + encodeURIComponent(document.referrer);
        shareDataUrl += "&a=share";
        shareDataUrl += "&cu=" + encodeURIComponent(self.elem.data('postUrl'));
        shareDataUrl += "&re=" + clickedReactions.join();
        shareDataUrl += "&sh=" + dest;
        shareDataUrl += "&rd=" + Date.now();

        sendPixel(shareDataUrl);
      }

      sendPageView();

      self.elem.find('li').click(react);
      self.elem.find('.rns-fb-share').click(shareFb);
      self.elem.find('.rns-twitter-share').click(shareTwitter);
      self.elem.find('.rns-whatsapp-share').click(shareWhatsApp);
      self.elem.find('.rns-pinterest-share').click(sharePinterest);
      self.elem.find('.rns-linkedin-share').click(shareLinkedin);
    
    }


    function initPlugin() {
      var posts = [];
      var postIds = []
      $.get(wpUrl, {action: 'rns_get_html'}, function(response) {
        $('.d_reactions').each(function() {
          this.addEventListener("touchstart", function() {}, true);
          $(this).html(response);
          postIds.push($(this).data('postId'));
          posts.push($(this));
        });

        $.post(wpUrl, {
            action: 'rns_get_reactions',
            posts: postIds
          },
          function(response) {
            $.each(posts, function(index, post) {
              var id = post.data('postId');
              var plugin = new Plugin(post, response[id])
            });
          }
        );
      });
    }

    initPlugin();

  });
  
  if ('createTouch' in document) {
    try {
      var ignore = /:hover/;
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if (sheet.cssRules && sheet.href && sheet.href.indexOf('react-and-share') != -1) {
          for (var j = sheet.cssRules.length - 1; j >= 0; j--) {

            var rule = sheet.cssRules[j];
            if (rule.type === CSSRule.STYLE_RULE && ignore.test(rule.selectorText)) {
              sheet.deleteRule(j);
            }
          }
        }
      }
    } catch (e) {
      
    }
  }


})(jQuery);


