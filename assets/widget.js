// WIDGET.JS takes care of injecting timedlinks onto a remote site
// Version: 1.0.0

var jQuery;
var app =  {
  init: function(){
    this.$domain = 'https://app.timedlinks.com';
    // this.$domain = 'http://timedlinks-staging.herokuapp.com';

    this.$timedlinks = jQuery("a[href*='#timedlink-']");

    // timedlinkIdentifier is defined by the <script></script> of the widget
    // The time display on the clock when the timedlink is open

    this.$popups_seen = []
    this.$waitTime = 0;
  },

  initialize_dependencies: function(){
    console.log('TIMEDLINKS --- initializing dependencies....');

    document.addEventListener("DOMContentLoaded", function(event){
      app.initializejQuery();
    });

  },
  closeIframe: function(){
    jQuery('#timedlink-widget-container').hide();
  },
  initializeScript: function(url, callback){
    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState) { //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  },

  initializejQuery: function(){

    if ( typeof jQuery == 'undefined' ) {
      this.initializeScript('https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', function(){
        //jQuery loaded
        // console.log('TIMEDLINKS --- jQuery loaded');
        // console.log('TIMEDLINKS --- initializing BootstrapJS....');


        app.handleJqueryLoaded();
      });
    } else {
      app.handleJqueryLoaded();
    }
  },

  initializeBoostrapJS: function(){
    // Bootstrap depends on Tether.io
    this.initializeScript('https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js', function(){
      app.initializeScript('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.5/js/bootstrap.min.js', function(){
        //Boostrap.min.js loaded
        console.log('TIMEDLINKS --- Bootstrap.min.js loaded');
        app.check_triggers_for_current_path();
      });
    });

  },

  handleJqueryLoaded: function(){
    console.log('TIMEDLINKS --- initializing other dependencies')
    // Will be true if bootstrap 3 is loaded, false if bootstrap 2 or no bootstrap
    if ( typeof do_not_load_boostrap !== 'undefined' ) {
      // alert("not loading bootastrap");
      this.init();
      if (typeof timedlink_dashboard !== 'undefined'){
        if (timedlink_dashboard == true){
          app.initialize_dashboard();
        };
      } else {
        app.check_triggers_for_current_path(false);
      }
    } else {
      this.initializeBoostrapJS();
      // this.initializeBootstrapStyle();
      this.init();
    }
    this.initialize_font_awesome();

    window.addEventListener("message", receiveMessage, false);
    function receiveMessage(event)
    {
      if (event.origin !== "https://app.timedlinks.com"){
        return;
      }

      if (event.data["status"] == 'OK'){
        window.location.href = event.data["url"];
      }
    }
  },

  initialize_dashboard: function(){
    console.log('initializing dashboard');
    var timedlink_json_path = app.$domain + '/widget/' + timedlinkIdentifier +'/user_timedlinks' + '.json';    

    jQuery.getJSON(timedlink_json_path, function(data, status, xhr){ 
      if (status === "success"){
        for (i = 0; i < data['links'].length; i++){
          app.inject_iframe_to_page(
          data["links"][i]['id'],
           data["links"][i]['strategy'],
           true
          );
        };
        console.log("TIMEDLINKS --- initialize_dashboard: success")
      } else if (status === "timeout"){
        console.log("TIMEDLINKS --- initialize_dashboard: success")("TIMEDLINKS --- initialize_dashboard: Something is wrong with the connection");
      } else if (status === "error" || status === "parsererror" ){
        console.log("TIMEDLINKS --- initialize_dashboard: success")("TIMEDLINKS --- initialize_dashboard: An error occured");
      } else{
        console.log("TIMEDLINKS --- initialize_dashboard: Something went wrong");
      }         
      
    })

    app.initialize_timedlinks();
  },

  initializeBootstrapStyle: function(){
    console.log('TIMEDLINKS --- initializing bootstrap.min.css....');

    // Boostrap might be better ingected as part of the theme to avoid conflicts
    var twitter_boostrap = window.jQuery("<link>", {
      rel: "stylesheet",
      type: "text/css",
      href: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
    });


    twitter_boostrap.appendTo('head');
  },

  initialize_font_awesome: function(){
    console.log('TIMEDLINKS --- initializing font-awesome.min.css....');

    // FontAwesome
    var font_awesome = jQuery("<link>", {
      rel: "stylesheet",
      type: "text/css",
      href: "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
    });

    font_awesome.appendTo('head');

  },
  initialize_timedlinks: function(){
    console.log('TIMEDLINKS --- initializing timedlinks....');
    var timedlinks = this.$timedlinks

    if ( typeof timedlink_page !== 'undefined' ) {
      console.log('initialize page template');
    } else {
      jQuery.each(timedlinks, function(index, value){
        // Get Selected Timedlink ID
        var timedlinkClickSelector =  jQuery(timedlinks[index]);
        var timedlink_id = timedlinkClickSelector.attr('href').replace('#timedlink-', '');

        app.initialize_click_triggers(timedlink_id, timedlinkClickSelector);
      });
    }
  },
  initialize_click_triggers: function(timedlink_id, timedlinkClickSelector){
    console.log('initialized click trigger')
    timedlinkClickSelector.on('click', function(){
      app.show_timedlink_popup(timedlink_id)
    })
  },
  check_triggers_for_current_path: function(initializeAllTriggers){
    console.log('Checking Load triggers');
    var current_path = window.location.href.replace("http://","").replace(window.location.host, "") || "/";
    var timedlink_json_path = app.$domain + '/widget/' + timedlinkIdentifier +'/timedlinks' + '.json' + '?domain=' + window.location.origin;
    
    console.log("path : " + timedlink_json_path);

    jQuery.getJSON(timedlink_json_path, function(data, status, xhr){ 
      if (status == "success"){
        if (data['count'] >= 1){
          if (initializeAllTriggers != false){
            if (data['page_load_count'] >= 1){
              console.log('initialize page load');
              var page_load_links   = data['page_load'];

              for (i = 0; i < page_load_links.length; i++){
                if ((data['page_load'][i]['trigger_source_url'] === current_path) || (data['page_load'][i]['trigger_source_url'] + "/" === current_path) ){
                  app.inject_iframe_to_page(
                    data['page_load'][i]['id'],
                    data['page_load'][i]['strategy']
                  );
                  app.checkIfIframeLoaded('page_load', data['page_load'][i]['id']);
                };
              };
            };

            if (data['page_scroll_count'] >= 1){
              console.log('initialize page scroll');
              var page_scroll_links = data['page_scroll'];

              for (i = 0; i < page_scroll_links.length; i++){
                if ((data['page_scroll'][i]['trigger_source_url'] === current_path) || (data['page_scroll'][i]['trigger_source_url'] + "/" === current_path) ){
                  app.inject_iframe_to_page(
                    data['page_scroll'][i]['id'],
                    data['page_scroll'][i]['strategy']
                  );
                  app.checkIfIframeLoaded(
                    'page_scroll',
                    data['page_scroll'][i]['id'],
                    data['page_scroll'][i]['trigger_page_scroll_percentage']
                  );
                };
              };
            };

            if (data['exit_intent_count'] >= 1){
              console.log('initialize exit intent');
              var exit_intent_links = data['exit_intent'];

              for (i = 0; i < exit_intent_links.length; i++){
                if (data['exit_intent'][i]['trigger_source_url'] === current_path){
                  app.inject_iframe_to_page(
                    data['exit_intent'][i]['id'],
                    data['exit_intent'][i]['strategy']
                  );
                  app.checkIfIframeLoaded(
                    'exit_intent',
                    data['exit_intent'][i]['id']
                  );
                };
              };
            };
          }

          if (data['click_count'] >= 1){
            var click_links = data['click'];

            for (i = 0; i < click_links.length; i++){
              var countdown_end_date = app.campaigHasEnded(data['click'][i]['countdown_end_date'])
              if ( (data['click'][i]['strategy'] == 'short_term_deal') && (app.campaigHasEnded(countdown_end_date) === true) ){
                // Do Nothing
                console.log('Campaign has ended');
              } else {
                app.inject_iframe_to_page(
                  data['click'][i]['id'],
                  data['click'][i]['strategy']
                );

                var timedlinkClickSelector =  jQuery("a[href*='#timedlink-" + data['click'][i]['id'] + "']")

                console.log('initialize clicks triggers');
                app.initialize_click_triggers(data['click'][i]['id'], timedlinkClickSelector);
              }
            };
          };
        }
        console.log("TIMEDLINKS --- check_triggers_for_current_path: success")
      } else if (status === "timeout"){
        console.log("TIMEDLINKS --- check_triggers_for_current_path: Something is wrong with the connection");
      } else if (status === "error" || status === "parsererror" ){
        console.log("TIMEDLINKS --- check_triggers_for_current_path: An error occured");
      } else {
        console.log("TIMEDLINKS --- check_triggers_for_current_path: Something went wrong");
      } 
    }) 
  },
  campaigHasEnded: function(countdown_end_date){
    if (typeof countdown_end_date !== 'undefined') {
      if (new Date(countdown_end_date) < new Date()){
        return false
      } else {
        return true
      }  
    } else {
      return true
    } 
  },
  checkIfIframeLoaded: function(trigger, timedlink_id, page_scroll_percentage){
    try {
      // Get a handle to the iframe element
      var iframe = document.getElementById('timedlink_iframe_' + timedlink_id);
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      console.log("Checking...")

      // Check if loading is complete
      if (iframeDoc.readyState == 'complete') {
        console.log("Iframe is Loaded...")
        app.afterIframeLoaded(trigger, timedlink_id, page_scroll_percentage);
        return;
      }
    } catch (err) {
      // alert(err);
      console.log(err);
    }
    // If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
    window.setTimeout(app.checkIfIframeLoaded, 100)
  },

  afterIframeLoaded: function(trigger, timedlink_id, page_scroll_percentage){
    switch(trigger){
      case 'page_load':
        console.log('initializing trigger:: Page Load')
        app.show_timedlink_popup(timedlink_id);
        break;
      case 'page_scroll':
        console.log('initializing trigger:: Page Scroll')
        app.monitorScrollPercentage(timedlink_id, page_scroll_percentage);
        break;
      case 'exit_intent':
        console.log('initializing trigger:: Exit Intent')
        app.monitorExitIntent(timedlink_id);
        break;
    }

    window.addEventListener("message", receiveMessage, false);
    function receiveMessage(event)
    {
      if (event.origin !== "https://app.timedlinks.com"){
        return;
      }

      if (event.data["status"] == 'OK'){
        window.location.href = event.data["url"];
      } else if (event.data == "unlock_popup_exit") {
        jQuery('.close-btn').show();
        app.handle_exits(timedlink_id);
      }
    }
  },

  inject_iframe_to_page: function(timedlink_id, strategy, preview){
    // console.log('TIMEDLINKS --- injecting timedlink body to page....');
    if (jQuery('#timedlink_style').length == 0){
      app.inject_iframe_style();
    }

    var iframe_code = '\
    <div class="timedlink-modal" id="timedlinkModal-' + timedlink_id + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> \
      <div class="timedlink-modal-content"> \
        <button class="close-btn" data-dismiss="timedlink-modal"> \
          <i class="fa fa-times fa-lg close-icon" aria-hidden="true" style="color: white; margin-top: 19px;"></i> \
        </button> \
        <iframe id="timedlink_iframe_' + timedlink_id + '" class="timedlinks_iframe" frameborder="0" scrolling="no" src="https://app.timedlinks.com/widget/' + timedlinkIdentifier + '/timedlinks/' + timedlink_id + '.html?preview=' + preview + '"/> \
      </div> \
    </div>';
    if (jQuery('#timedlink-widget-container').length == 0){
      jQuery('body').append("<div id='timedlink-widget-container'>" + iframe_code + "</div>");
    } else {
      jQuery('#timedlink-widget-container').append(iframe_code);
    }
    
    if (strategy == 'expiring_deal'){
      jQuery('.close-btn').hide();
    } else {
      app.handle_exits(timedlink_id);
    }

  },
  handle_exits: function(timedlink_id){
  // Close when user clik close-btn
    jQuery('#timedlink-widget-container').on('click', function(){ 
      console.log('clicked close')
      jQuery('#timedlink_iframe_' + timedlink_id)[0].contentWindow.postMessage({action: 'closed_popup',timedlink_id: timedlink_id}, "*")
      jQuery('#timedlink-widget-container #timedlinkModal-' + timedlink_id).hide();
      jQuery('#timedlink-widget-container #timedlinkModal-' + timedlink_id).modal('hide');
    })

    // Close when user press ESC
    jQuery(document).keyup(function(e) {
      if (e.keyCode == 27) { // escape key maps to keycode `27`
        jQuery('#timedlink-widget-container #timedlinkModal-' + timedlink_id).hide();
      }
    });
  },

  inject_timedlink_style_to_page: function(template_css){
    // console.log('TIMEDLINKS --- injecting timedlink style to page....');
    jQuery('body').append('<style>' + template_css + '</style>');
  },

  inject_iframe_style: function(){
    jQuery('body').append(`
      <style id='timedlink_style'>
        .timedlink-modal{
          position: fixed; /* Stay in place */
          z-index: 99999; /* Sit on top */
          left: 0;
          top: 0;
          width: 100%; /* Full width */
          height: 100%; /* Full height */
          overflow: auto; /* Enable scroll if needed */
          background-color: rgb(0,0,0); /* Fallback color */
          background-color: #000000cf; /* Black w/ opacity */
          display: none;
        }

        .timedlink-modal-content{
          margin: 6% auto; /* 6% from the top and centered */
          border-radius: 4px;
          width: 80%; /* Could be more or less, depending on screen size */
        }

        .timedlink-modal-content .timedlinks_iframe{
          width: 100%;
          /* max-width: 1100px; */
          /* min-height: 547px; */ 
          min-height: 560px;
          border: 7px solid #80808038;
          border-radius: 2px;
          display: inline-block;
        }

        .timedlink-modal-content .close-btn {
          position: absolute;
          right: 0px;
          background-color: black;
          border: none;
          z-index: 999;
          padding: 11px 14px;
          cursor: pointer;
        }

        .timedlink-modal-content .close-btn .close-icon{
          margin-top: 0 !important;
        }

      </style>
    `);

  },

  get_user_ip: function(){
    // console.log('TIMEDLINKS --- getting user ip....');
    var ret_ip;
    jQuery.ajaxSetup({async: false});
    jQuery.get('http://jsonip.com/', function(r){
      ret_ip = r.ip;
    });
    return ret_ip;
  },

  show_timedlink_popup: function(timedlink_id){
    console.log('opening timedlink popup')
    jQuery('#timedlinkModal-' + timedlink_id).show()
    jQuery('#timedlink_iframe_' + timedlink_id)[0].contentWindow.postMessage({action: 'opened_popup',timedlink_id: timedlink_id}, "*")
  },

  monitorScrollPercentage: function(timedlink_id, percentage_trigger){
    jQuery(document).ready(function() {
      jQuery(window).scroll(function(e){
        var scrollTop = jQuery(window).scrollTop();
        var docHeight = jQuery(document).height();
        var winHeight = jQuery(window).height();
        var scrollPercent = (scrollTop) / (docHeight - winHeight);
        var scrollPercentRounded = Math.round(scrollPercent*100);
        console.log('scrollPercent:  ' + scrollPercent)
          if (scrollPercentRounded){
            if (app.$popups_seen.indexOf(timedlink_id) == -1){
              if (jQuery("#timedlinkModal-" + timedlink_id).is(':hidden')) {
                app.show_timedlink_popup(timedlink_id);
                app.$popups_seen.push(timedlink_id)
              }
            }
          };
      });
    });
  },

  monitorExitIntent: function(timedlink_id){
    document.addEventListener("mouseleave", function(e){
        if( e.clientY < 0 )
        {
          if (app.$popups_seen.indexOf(timedlink_id) == -1){
            app.show_timedlink_popup(timedlink_id);
            app.$popups_seen.push(timedlink_id)
          }
        }
    }, false);
  }
}

app.initialize_dependencies();
