<?php
/**
 * Plugin Name:       Garden
 * Description:
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
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
				'token' => JOSH412_SECRET_TOKEN
			]
		);
	}


}
add_action( 'init', 'josh412_garden_source_block_init' );
