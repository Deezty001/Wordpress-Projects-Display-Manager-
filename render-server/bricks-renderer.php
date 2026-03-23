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
        'permission_callback' => 'br_verify_secret_token'
    ));

    register_rest_route('bricks-render/v1', '/delete', array(
        'methods' => 'DELETE',
        'callback' => 'br_delete_page',
        'permission_callback' => 'br_verify_secret_token'
    ));
});

function br_verify_secret_token($request) {
    if ($request->get_method() === 'GET') return true; 

    $secret = $request->get_param('secret');
    $header_key = $request->get_header('X-API-Key');
    $expected_secret = defined('BRICKS_RENDER_SECRET') ? BRICKS_RENDER_SECRET : null;

    if (empty($expected_secret)) {
        return new WP_Error('unauthorized', 'Unauthorized: Secret not configured on server.', array('status' => 401));
    }

    if ($secret !== $expected_secret && $header_key !== $expected_secret) {
        return new WP_Error('unauthorized', 'Unauthorized: Invalid or missing secret token.', array('status' => 401));
    }
    return true;
}

function br_generate_page($request) {
    $title = sanitize_text_field($request->get_param('title'));
    $json_content = $request->get_param('content'); // The Bricks JSON
    
    if (empty($json_content)) {
        return new WP_Error('missing_content', 'Content is required', array('status' => 400));
    }

    // Decode the JSON to ensure it is valid
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
    $bricks_meta = is_array($bricks_data) ? $bricks_data : array($bricks_data);
    
    if (isset($bricks_meta['content']) && is_array($bricks_meta['content'])) {
        $bricks_meta = $bricks_meta['content'];
    } elseif (isset($bricks_meta['data']) && is_array($bricks_meta['data'])) {
        $bricks_meta = $bricks_meta['data'];
    } elseif (isset($bricks_meta['id']) && isset($bricks_meta['name'])) {
        $bricks_meta = array($bricks_meta);
    } else {
        $bricks_meta = array_values($bricks_meta);
    }

    update_post_meta($post_id, '_bricks_page_content_2', $bricks_meta);
    update_post_meta($post_id, '_bricks_editor_mode', 'bricks');
    update_post_meta($post_id, '_wp_page_template', 'template-canvas.php');
    
    // 3. Add Live Customization Support
    add_action('wp_head', function() {
        $clean = isset($_GET['bv_clean']) && $_GET['bv_clean'] === '1';
        $classes_raw = isset($_GET['bv_classes']) ? sanitize_text_field($_GET['bv_classes']) : '';
        
        if ($clean || $classes_raw) {
            echo '<style id="bv-customizations">';
            if ($clean) {
                echo '
                body, body * { 
                    color: #71717a !important; 
                    background-color: transparent !important;
                    border-color: #3f3f46 !important;
                    font-family: monospace !important;
                }
                img, video, iframe { opacity: 0.2 !important; filter: grayscale(1) !important; }
                .brxe-button, button { background: #27272a !important; border: 1px solid #3f3f46 !important; }
                ';
            }
            echo '</style>';
            
            if (!empty($classes_raw)) {
                $classes_array = array_filter(explode(' ', $classes_raw));
                // Harden: Only allow alphanumeric and hyphens in class names
                $classes_array = array_map(function($c) {
                    return preg_replace('/[^a-zA-Z0-9-]/', '', $c);
                }, $classes_array);
                $classes_array = array_filter($classes_array);

                if (!empty($classes_array)) {
                    printf(
                        '<script id="bv-class-injection">window.addEventListener("DOMContentLoaded", () => {
                            const root = document.querySelector("#brx-content > *:first-child") || document.body;
                            const classes = %s;
                            root.classList.add(...classes);
                        });</script>',
                        wp_json_encode(array_values($classes_array))
                    );
                }
            }
        }
    });

    // Return the permalink to the generated page
    return rest_ensure_response(array(
        'success' => true,
        'page_id' => $post_id,
        'url'     => get_permalink($post_id)
    ));
}

function br_delete_page($request) {
    $url = $request->get_param('url');
    if (empty($url)) {
        return new WP_Error('missing_url', 'URL is required', array('status' => 400));
    }

    $post_id = url_to_postid($url);
    if (!$post_id) {
        return new WP_Error('not_found', 'Page not found for the given URL', array('status' => 404));
    }

    $deleted = wp_delete_post($post_id, true); // Force delete (skip trash)

    if (!$deleted) {
        return new WP_Error('delete_failed', 'Failed to delete page', array('status' => 500));
    }

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'Page deleted successfully'
    ));
}


