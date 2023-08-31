<?php

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
