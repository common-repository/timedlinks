<?php
/*
    Plugin Name: Timedlinks for Wordpress
    Plugin URI: https://timedlinks.com
    Description: Timedlinks has everything you need to create a poppup. It's a powerful time-based conversion optimization toolkits.
    Version: 1.0.0
    Author: Timedlinks
    License: GPLv2 or later
    License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

if ( ! defined('ABSPATH')) exit;  // if direct access 

class timedlinks_for_wordpress{
	
	public function __construct(){
        
        $this->define_constants();
        $this->define_classes();


        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

        add_action( 'init', array( $this, 'add_settings' ) );
    }
    
    function enqueue_scripts(){

        $twp_api_key = get_option( 'twp_api_key' );

        wp_enqueue_script( 'jquery' );
        wp_enqueue_script('timedlinks_js', 'https://app.timedlinks.com/widget.js' );
        wp_add_inline_script( 'timedlinks_api', "<script>var timedlinkIdentifier='$twp_api_key';</script>" );
    }

    function add_settings(){
 
        $twp_panel_settings = array(

            'page_nav' => __( 'Settings', TWP_TEXT_DOMAIN ),
            'priority' => 10,
            'page_settings' => array(

                'twp_settings_general'	=> array(
                    'options' => array(
                        array(
                            'id'		=> 'twp_api_key',
                            'title'		=> __('Timedlink Identifier',TWP_TEXT_DOMAIN),
                            'details'	=> 'Please set your Timedlink Identifier key here <br> 
                                <a href="http://app.timedlinks.com/dashboard" target="_blank">Go To Dashboard</a>', 
                            'type'		=> 'text',
                            'placeholder' => 'TMDTWUYFDYTDKHDFSTYDFDSGHF',
                        ),
                        
                    )
                ),
                
            ),
        );

        $args = array(
            'add_in_menu' => true,
            'menu_type' => 'main',
            'menu_title' => __( 'Timedlinks', TWP_TEXT_DOMAIN ),
            'page_title' => __( 'Timedlinks for Wordpress', TWP_TEXT_DOMAIN ), 
            'menu_page_title' => __( 'Timedlinks for Wordpress', TWP_TEXT_DOMAIN ) . 
                sprintf( '<img style="margin-left: 25px;vertical-align: bottom;" src="%sassets/logo.svg">', TWP_PLUGIN_URL ),
            'capability' => "manage_options",
            'menu_slug' => "timedlinks",
            'pages' => apply_filters( 'twp_filters_setting_pages', array(
                'twp_panel_settings' => $twp_panel_settings,
            ) ),
            'position' => 60,
            'menu_icon' => 'dashicons-clock',
        );

        new Pick_settings( $args );
    }

    function define_classes(){

		require_once( TWP_PLUGIN_DIR . 'includes/class-pick-settings.php');	
    }
	
    function define_constants(){

        define('TWP_PLUGIN_URL', WP_PLUGIN_URL . '/' . plugin_basename( dirname(__FILE__) ) . '/' );
		define('TWP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
		define('TWP_TEXT_DOMAIN', 'timedlinks' );
    }

} new timedlinks_for_wordpress();

