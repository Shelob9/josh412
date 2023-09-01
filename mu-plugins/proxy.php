<?php
return;
//@todo bypass if not dev

$path = $_SERVER['REQUEST_URI'];
if( str_starts_with(
    $path,
    '/josh412',
)){
    $url = 'https://cdn.josh412.com/josh412/collections/gm/months/Aug-2023.json';
    $response = wp_remote_get(
        $url,
        [
            'headers' => [
                'Host' => 'josh412.com'
            ],
            'sslverify' => false
        ]
    );
    if( is_wp_error( $response ) ){
        dd( $response );
    }

    $body = wp_remote_retrieve_body( $response );
    header( 'Content-Type: application/json; charset=' . get_option( 'blog_charset' ) );
	status_header(
        wp_remote_retrieve_response_code( $response )
    );

	echo wp_json_encode( $response['body'] );
    exit;

}
