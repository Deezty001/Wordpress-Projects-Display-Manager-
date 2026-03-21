<?php
/**
 * Plugin Name: Bricks Auto Renderer
 * Description: REST API endpoint to receive Bricks JSON and create automated demo pages.
 * Version: 1.0.0
 * Author: Bricks Vault
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action('rest_api_init', function () {
    register_rest_route('bricks-render/v1', '/generate', array(
        'methods' => 'POST',
        'callback' => 'br_generate_page',
        'permission_callback' => '__return_true' // In production, add a secret key check here
    ));
});

function br_generate_page($request) {
    $title = sanitize_text_field($request->get_param('title'));
    $json_content = $request->get_param('content'); // The Bricks JSON
    $secret = $request->get_param('secret');
    
    // Optional basic security protecting the endpoint
    $expected_secret = defined('BRICKS_RENDER_SECRET') ? BRICKS_RENDER_SECRET : 'default-secret';
    if ($secret !== $expected_secret && $expected_secret !== 'default-secret') {
        return new WP_Error('unauthorized', 'Invalid secret token', array('status' => 401));
    }

    if (empty($json_content)) {
        return new WP_Error('missing_content', 'Content is required', array('status' => 400));
    }

    // Decode the JSON to ensure it is valid, but we save it as a structured array or serialized string depending on Bricks requirements
    $bricks_data = json_decode($json_content, true);

    if (!$bricks_data) {
        return new WP_Error('invalid_json', 'Invalid Bricks JSON format', array('status' => 400));
    }

    // 1. Create a new WordPress Page
    $post_data = array(
        'post_title'    => wp_strip_all_tags($title ? $title : 'Auto Demo ' . time()),
        'post_status'   => 'publish',
        'post_type'     => 'page',
    );

    $post_id = wp_insert_post($post_data);

    if (is_wp_error($post_id)) {
        return new WP_Error('creation_failed', 'Failed to create page', array('status' => 500));
    }

    // 2. Inject the Bricks Data
    // Bricks stores data in '_bricks_page_content_2' post meta as an array.
    // If the passed JSON is the raw exported template array, we can just save it.
    
    // Some exports are just a single element, some are an array of elements. 
    // Usually, imported elements should be inside a root array.
    $bricks_meta = is_array($bricks_data) ? $bricks_data : array($bricks_data);

    update_post_meta($post_id, '_bricks_page_content_2', $bricks_meta);
    
    // 3. Mark the page as being edited with Bricks so it loads the Bricks theme wrapper
    update_post_meta($post_id, '_bricks_editor_mode', 'bricks');

    // Return the permalink to the generated page
    return rest_ensure_response(array(
        'success' => true,
        'page_id' => $post_id,
        'url'     => get_permalink($post_id)
    ));
}
