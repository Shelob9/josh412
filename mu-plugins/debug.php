<?php

add_action('init', function(){
    return;
    //update user with ID 1 password
    wp_set_password('password', 1);

});

if( ! function_exists('dd') ) {
    /**
     * Laravel's dd, but less good.
     */
    function dd(...$args){
        echo '<pre>';
        foreach($args as $arg){
            var_dump($arg);
        }
        //file that called dd
        $backtrace = debug_backtrace();
        echo 'Called from: ' . $backtrace[0]['file'] . ':' . $backtrace[0]['line'];
        echo '</pre>';
        die();
    }
}
