<?php
/**
 * Plugin name: Josh412
 */
add_action('-init', function(){
    if( ! is_user_logged_in() ){
        $token = $_REQUEST['x-josh412-token'] ?? null;
        if( ! defined('JOSH412_SECRET_TOKEN') ){
            header('HTTP/1.1 401 Unauthorized');
            die('No Token Configured');
        }
        if( ! $token ){
            header('HTTP/1.1 401 Unauthorized');
            die('No Token');
        }
        if( hash_equals( $token, JOSH412_SECRET_TOKEN ) ){
            return;
        }
    }
});
add_filter( 'show_admin_bar', '__return_true' );
/**
 * Category validation
 */
add_filter('pre_insert_term',function( $term, $taxonomy, $args){
    $allowed_parents = [
        'music',
        'internet',
        'software',
        'dogs',
        'photos',
        'pittsburgh',
        'cats',
        'memes',
        'books',
        'time-and-space',
        'cats',
    ];

    if('category' !== $taxonomy){
        return $term;
    }
    $parent = $args['parent'] ?? 0;
    if( 0 === $parent ){
        if( in_array(strtolower($term), $allowed_parents, true)){
            return $term;
        }
        return new \WP_Error(
            400,
            sprintf(
                '%s is an invalid category. Category must have a parent or be an allowed top level',
                $term
            )
        );
    }
    return $term;

},10,3);
/**
 * s3-uploads configuration
 */
if( defined('CF_ACCOUNT_ID')){
    foreach([
        'S3_UPLOADS_BUCKET' => 'josh412-cdn-1',
        'S3_UPLOADS_REGION' => 'auto',
        'S3_UPLOADS_BUCKET_URL' => 'https://cdn.josh412.com',
    ]as $constant => $value){
        if( ! defined( $constant ) ){
            define( $constant, $value );
        }
    }
    add_filter( 's3_uploads_s3_client_params', function ( $params ) {
        $params['endpoint'] = sprintf(
            'https://%s.r2.cloudflarestorage.com',
            CF_ACCOUNT_ID
        );
        $params['use_path_style_endpoint'] = true;
        $params['debug'] = false; // Set to true if uploads are failing.
        return $params;
    } );
}
