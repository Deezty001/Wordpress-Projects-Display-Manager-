<?php
/**
 * Plugin Name: Bricks Vault Connector
 * Description: One-click "Magic Handshake" connection to your Bricks Vault and direct "Save to Vault" integration inside the Bricks Editor.
 * Version: 1.0.0
 * Author: Bricks Vault Team
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class Bricks_Vault_Connector {

    private $vault_url;
    private $token_option = 'bricks_vault_token';

    public function __construct() {
        // Set this to your Vault's live URL (or use a setting)
        $this->vault_url = get_option('bricks_vault_url', 'http://localhost:8080');

        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'handle_handshake_callback']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_bricks_scripts']);
        
        // AJAX handlers for the Bricks Editor
        add_action('wp_ajax_vault_save_template', [$this, 'ajax_save_template']);
    }

    public function add_admin_menu() {
        add_menu_page(
            'Bricks Vault',
            'Vault Connector',
            'manage_options',
            'bricks-vault-connector',
            [$this, 'render_admin_page'],
            'dashicons-cloud-upload'
        );
    }

    public function render_admin_page() {
        $token = get_option($this->token_option);
        $site_name = get_bloginfo('name');
        $site_url = get_site_url();
        ?>
        <div class="wrap" style="max-width: 600px; margin-top: 40px;">
            <h1 style="font-weight: 900; font-size: 2em; letter-spacing: -1px;">Vault Connector</h1>
            <p style="color: #666; margin-bottom: 30px;">Directly link this WordPress site to your Bricks Vault library.</p>

            <?php if ($token): ?>
                <div style="background: #e7f9ed; border: 1px solid #c3e6cb; padding: 20px; border-radius: 12px; color: #155724;">
                    <strong style="display: block; margin-bottom: 5px;">✅ Vault Connected</strong>
                    <p style="margin: 0; font-size: 13px;">This site is securely linked and ready to push templates to your vault.</p>
                </div>
                <form method="post" action="" style="margin-top: 20px;">
                    <input type="hidden" name="disconnect_vault" value="1">
                    <?php submit_button('Disconnect Site', 'delete'); ?>
                </form>
            <?php else: ?>
                <div style="background: #fff; border: 1px solid #ddd; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <h3 style="margin-top: 0;">Connect to My Vault</h3>
                    <p style="font-size: 14px; line-height: 1.6;">Link your vault in one click. No API keys or complex setup required.</p>
                    
                    <form method="post" action="">
                        <input type="hidden" name="init_handshake" value="1">
                        <button type="submit" style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; display: flex; items-center gap: 8px;">
                            🚀 Magic Connect Now
                        </button>
                    </form>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    public function handle_handshake_callback() {
        // 1. Initiate Handshake
        if (isset($_POST['init_handshake'])) {
            $site_name = get_bloginfo('name');
            $site_url = get_site_url();

            $response = wp_remote_post($this->vault_url . '/api/handshake', [
                'headers' => ['Content-Type' => 'application/json'],
                'body' => json_encode([
                    'siteName' => $site_name,
                    'siteUrl' => $site_url
                ])
            ]);

            if (!is_wp_error($response)) {
                $data = json_decode(wp_remote_retrieve_body($response));
                if (isset($data->authUrl)) {
                    // Store callback URL so we can handle the return redirect? 
                    // No, the Vault UI will just redirect back to this page with params.
                    wp_redirect($data->authUrl);
                    exit;
                }
            }
        }

        // 2. Handle the "Approve" redirect back (using simple GET params for now)
        if (isset($_GET['page']) && $_GET['page'] === 'bricks-vault-connector' && isset($_GET['token'])) {
            update_option($this->token_option, sanitize_text_field($_GET['token']));
            wp_redirect(admin_url('admin.php?page=bricks-vault-connector&connected=1'));
            exit;
        }

        // 3. Disconnect
        if (isset($_POST['disconnect_vault'])) {
            delete_option($this->token_option);
            wp_redirect(admin_url('admin.php?page=bricks-vault-connector'));
            exit;
        }
    }

    public function enqueue_bricks_scripts($hook) {
        // Only load inside the Bricks Builder editor
        if (isset($_GET['bricks']) && $_GET['bricks'] === 'run') {
            wp_enqueue_script('bricks-vault-logic', plugin_dir_url(__FILE__) . 'assets/bricks-integration.js', ['jquery'], '1.0.0', true);
            wp_localize_script('bricks-vault-logic', 'bricksVaultSettings', [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('vault_save_nonce')
            ]);
        }
    }

    public function ajax_save_template() {
        check_ajax_referer('vault_save_nonce', 'nonce');
        
        $token = get_option($this->token_option);
        if (!$token) wp_send_json_error('Vault not connected');

        $title = sanitize_text_field($_POST['title']);
        $category = sanitize_text_field($_POST['category']);
        $content = $_POST['content']; // Expecting JSON string

        $response = wp_remote_post($this->vault_url . '/api/remote/save', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token
            ],
            'body' => json_encode([
                'title' => $title,
                'category' => $category,
                'content' => $content
            ])
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error('Communication error with vault');
        }

        wp_send_json_success(json_decode(wp_remote_retrieve_body($response)));
    }
}

new Bricks_Vault_Connector();
