<?php
/**
 * Plugin Name:       Garden
 * Description:
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.4.1
 * Author:            Josh Pollock
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       garden-source
 *
 * @package Josh412
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function josh412_garden_source_block_init() {

	$block = register_block_type( __DIR__ . '/build' );
	if( defined('JOSH412_SECRET_TOKEN') && $block && ! is_wp_error( $block ) ){
		wp_localize_script(
			$block->editor_script_handles[0],
			'GARDEN',
			[
				'token' => JOSH412_SECRET_TOKEN,
				'apiUrl' => defined('JOSH412_API_URL') ? JOSH412_API_URL : 'https://josh412.com/api'
			]
		);
		add_action('enqueue_block_editor_assets',function(){
			//register sidebar.js
			$assets = include plugin_dir_path( __FILE__ ) . 'build/sidebar.asset.php';
			wp_enqueue_script(
				'josh412-garden-source-sidebar',
				plugin_dir_url( __FILE__ ) . 'build/sidebar.js',
				$assets['dependencies'],
				$assets['version'],
				true
			);
		});

	}


}
add_action( 'init', 'josh412_garden_source_block_init' );

add_action('wp_dashboard_setup', function ()
{
	$handle = 'gardensource-dashboard';

	$assets = include plugin_dir_path( __FILE__ ) . 'build/dashboard.asset.php';
    wp_enqueue_script(
        $handle,
        plugin_dir_url(__FILE__) . 'build/dashboard.js',
        $assets['dependencies'],
        $assets['version'],
        true
    );
	wp_localize_script(
		$handle,
		'GARDEN',
		[
			'token' => defined('JOSH412_SECRET_TOKEN') ? JOSH412_SECRET_TOKEN : '12345',
			'apiUrl' => defined('JOSH412_API_URL') ? JOSH412_API_URL : 'https://josh412.com/api'
		]
	);
    global $wp_meta_boxes;
    $wp_meta_boxes['dashboard']['normal']['core'] = array();
    $wp_meta_boxes['dashboard']['side']['core'] = array();
}, 9999 );




class GardenSource{

	public static function create_media_item_from_existing_file(string $filename, string $filetype, int $parent_post_id = 0) {
			require_once( ABSPATH . 'wp-admin/includes/image.php' );


			$wp_upload_dir = wp_upload_dir();
			$file = $wp_upload_dir['path'] . '/' . basename( $filename );

			$attachment = [
				'file' => $file,
				'guid'           => $wp_upload_dir['url'] . '/' . basename( $filename ),
				'post_mime_type' => $filetype,
				'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $filename ) ),
				'post_content'   => '',
				'post_status'    => 'inherit'
			];

			$attach_id = wp_insert_attachment( $attachment, $file, $parent_post_id );
			if($parent_post_id ){
				$attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
				wp_update_attachment_metadata( $attach_id, $attach_data );

				set_post_thumbnail( $parent_post_id, $attach_id );
			}

			return $attachment_id;
	}
}
