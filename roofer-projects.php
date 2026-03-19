<?php
/**
 * Plugin Name: Custom Projects Management
 * Plugin URI:  https://antigravity.google
 * Description: Registers a custom post type for Projects and provides a settings page to define dynamic attributes (Location, Materials, etc.) along with a photo gallery. Optimized for Bricks Builder.
 * Version:     1.2.0
 * Author:      Antigravity
 * Text Domain: custom-projects
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Custom_Projects_Plugin {

    public function __construct() {
        // Register Custom Post Type
        add_action('init', [$this, 'register_cpt']);
        
        // Register Meta Boxes
        add_action('add_meta_boxes', [$this, 'add_custom_meta_boxes']);
        
        // Save Meta Box Data
        add_action('save_post', [$this, 'save_custom_meta']);
        
        // Enqueue Admin Scripts for Media Uploader
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);

        // Register Settings Page
        add_action('admin_menu', [$this, 'register_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action( 'admin_init', [ $this, 'handle_bulk_import_actions' ] );

        // Register AJAX Instant Database Savers
        add_action( 'wp_ajax_roofer_save_gallery', [$this, 'ajax_save_gallery'] );
        add_action( 'wp_ajax_roofer_save_secondary_image', [$this, 'ajax_save_secondary_image'] );

        // Bricks Builder Tag Renderer
        add_filter( 'bricks/dynamic_data/render_tag', [$this, 'render_custom_projects_tag'], 10, 3 );
    }

    /**
     * Register Custom Post Type: Project
     */
    public function register_cpt() {
        $labels = [
            'name'                  => _x( 'Projects', 'Post type general name', 'custom-projects' ),
            'singular_name'         => _x( 'Project', 'Post type singular name', 'custom-projects' ),
            'menu_name'             => _x( 'Projects', 'Admin Menu text', 'custom-projects' ),
            'name_admin_bar'        => _x( 'Project', 'Add New on Toolbar', 'custom-projects' ),
            'add_new'               => __( 'Add New', 'custom-projects' ),
            'add_new_item'          => __( 'Add New Project', 'custom-projects' ),
            'new_item'              => __( 'New Project', 'custom-projects' ),
            'edit_item'             => __( 'Edit Project', 'custom-projects' ),
            'view_item'             => __( 'View Project', 'custom-projects' ),
            'all_items'             => __( 'All Projects', 'custom-projects' ),
            'search_items'          => __( 'Search Projects', 'custom-projects' ),
            'not_found'             => __( 'No projects found.', 'custom-projects' ),
            'not_found_in_trash'    => __( 'No projects found in Trash.', 'custom-projects' ),
        ];

        $args = [
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => [ 'slug' => 'projects' ],
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 20,
            'menu_icon'          => 'dashicons-hammer',
            'supports'           => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
            'show_in_rest'       => true,
        ];

        register_post_type( 'roofer_project', $args );

        // Register Taxonomy: Project Categories
        $tax_labels = [
            'name'              => _x( 'Project Categories', 'taxonomy general name', 'custom-projects' ),
            'singular_name'     => _x( 'Project Category', 'taxonomy singular name', 'custom-projects' ),
            'search_items'      => __( 'Search Categories', 'custom-projects' ),
            'all_items'         => __( 'All Categories', 'custom-projects' ),
            'parent_item'       => __( 'Parent Category', 'custom-projects' ),
            'parent_item_colon' => __( 'Parent Category:', 'custom-projects' ),
            'edit_item'         => __( 'Edit Category', 'custom-projects' ),
            'update_item'       => __( 'Update Category', 'custom-projects' ),
            'add_new_item'      => __( 'Add New Category', 'custom-projects' ),
            'new_item_name'     => __( 'New Category Name', 'custom-projects' ),
            'menu_name'         => __( 'Categories', 'custom-projects' ),
        ];

        $tax_args = [
            'hierarchical'      => true,
            'labels'            => $tax_labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => [ 'slug' => 'project-category' ],
            'show_in_rest'      => true,
        ];

        register_taxonomy( 'roofer_project_category', [ 'roofer_project' ], $tax_args );

        // One-time flush rewrite rules to fix the 404 issue automatically
        if ( get_option( 'roofer_projects_flushed_rewrite' ) !== 'v3' ) {
            flush_rewrite_rules();
            update_option( 'roofer_projects_flushed_rewrite', 'v3' );
        }
    }

    /**
     * Settings Page for Attributes
     */
    public function register_settings_page() {
        add_submenu_page(
            'edit.php?post_type=roofer_project',
            __( 'Settings', 'custom-projects' ),
            __( 'Settings', 'custom-projects' ),
            'manage_options',
            'roofer_project_settings',
            [ $this, 'render_settings_page' ]
        );
        add_submenu_page(
            'edit.php?post_type=roofer_project',
            __( 'Bulk Import', 'custom-projects' ),
            __( 'Bulk Import', 'custom-projects' ),
            'manage_options',
            'roofer_project_import',
            [ $this, 'render_bulk_import_page' ]
        );
    }

    public function register_settings() {
        register_setting( 'custom_project_settings_group', 'custom_project_attributes' );
        register_setting( 'custom_project_settings_group', 'roofer_grid_desktop_cols' );
        register_setting( 'custom_project_settings_group', 'roofer_grid_tablet_cols' );
        register_setting( 'custom_project_settings_group', 'roofer_grid_mobile_cols' );
        register_setting( 'custom_project_settings_group', 'roofer_grid_bento_style' );
        register_setting( 'custom_project_settings_group', 'roofer_filter_active_color' );
    }

    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php _e( 'Project Settings', 'custom-projects' ); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields( 'custom_project_settings_group' ); ?>
                <?php do_settings_sections( 'custom_project_settings_group' ); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php _e( 'Custom Attributes', 'custom-projects' ); ?></th>
                        <td>
                            <textarea name="custom_project_attributes" rows="5" cols="50" class="large-text"><?php echo esc_textarea( get_option( 'custom_project_attributes', "Location\nCompletion Date\nMaterials Used" ) ); ?></textarea>
                            <p class="description"><?php _e( 'Enter one attribute per line. For example: Location, Size, Cost. These will automatically appear as text fields on your Project editing screen.', 'custom-projects' ); ?></p>
                        </td>
                    </tr>
                </table>
                
                <hr>
                <h2><?php _e( 'Gallery Shortcode Visual Settings', 'custom-projects'); ?> <code>[roofer_projects_gallery]</code></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Desktop Columns</th>
                        <td><input type="number" step="1" min="1" max="10" name="roofer_grid_desktop_cols" value="<?php echo esc_attr(get_option('roofer_grid_desktop_cols', 3)); ?>" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Tablet Columns</th>
                        <td><input type="number" step="1" min="1" max="10" name="roofer_grid_tablet_cols" value="<?php echo esc_attr(get_option('roofer_grid_tablet_cols', 2)); ?>" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Mobile Columns</th>
                        <td><input type="number" step="1" min="1" max="10" name="roofer_grid_mobile_cols" value="<?php echo esc_attr(get_option('roofer_grid_mobile_cols', 1)); ?>" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Bento Layout (Hero Style)</th>
                        <td>
                            <label>
                                <input type="checkbox" name="roofer_grid_bento_style" value="1" <?php checked(1, get_option('roofer_grid_bento_style', 1)); ?> /> 
                                Make the very first newest project span double width & height (Uncheck to strictly "Fit All").
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Filter Accent Color</th>
                        <td>
                            <input type="color" name="roofer_filter_active_color" value="<?php echo esc_attr(get_option('roofer_filter_active_color', '#09090b')); ?>" />
                            <p class="description">Color of the category filter buttons when active or hovered over.</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr>
            <h2><?php _e( 'Plugin Changelog', 'custom-projects'); ?></h2>
            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4; box-shadow: 0 1px 1px rgba(0,0,0,.04); max-width: 800px;">
                <h3 style="margin-top: 0;">v1.2.0 - <?php echo date('Y-m-d'); ?></h3>
                <ul style="list-style-type: disc; margin-left: 20px;">
                    <li><strong>Feature:</strong> Added a live changelog tracking system to the backend settings.</li>
                    <li><strong>Integration:</strong> Integrated the YahnisElsts <code>plugin-update-checker</code> SDK to enable instant automatic push updates via GitHub API.</li>
                    <li><strong>Bugfix:</strong> Completely rebuilt the Bricks Builder inline text replacement engine utilizing <code>preg_match_all</code> Regex compilers for perfect substring extraction.</li>
                </ul>
                <hr style="margin: 20px 0;">
                <h3 style="margin-top: 0; color: #646970;">v1.1.0</h3>
                <ul style="list-style-type: disc; margin-left: 20px; color: #646970;">
                    <li><strong>Feature:</strong> Introduced the Bulk CSV Importer engine with dynamic template allocation.</li>
                    <li><strong>Fix:</strong> Corrected the Secondary Featured Image template parsing logic to securely bind native Attachment Object arrays back to Bricks context handlers.</li>
                </ul>
            </div>
        </div>
        <?php
    }

    public function handle_bulk_import_actions() {
        if ( ! current_user_can( 'manage_options' ) ) return;

        // 1. Handle Template Download
        if ( isset( $_GET['download_roofer_template'] ) && $_GET['download_roofer_template'] == '1' ) {
            $attributes_string = get_option( 'custom_project_attributes', "Location\nCompletion Date\nMaterials Used" );
            $attributes_array = array_filter( array_map( 'trim', explode( "\n", str_replace( "\r", "", $attributes_string ) ) ) );

            $headers = array_merge( [ 'Title', 'Description', 'Categories (comma-separated)' ], $attributes_array );

            header( 'Content-Type: text/csv; charset=utf-8' );
            header( 'Content-Disposition: attachment; filename=roofer_projects_template.csv' );
            $output = fopen( 'php://output', 'w' );
            fputcsv( $output, $headers );
            
            // Output a sample row
            $sample = [ 'Example Warehouse', 'Detailed description of the roofing project.', 'Commercial, Industrial' ];
            foreach ( $attributes_array as $attr ) {
                if ( strtolower( $attr ) == 'location' ) $sample[] = 'Sydney, NSW';
                elseif ( strtolower( $attr ) == 'completion date' ) $sample[] = date("Y");
                else $sample[] = 'Sample Data';
            }
            fputcsv( $output, $sample );
            fclose( $output );
            exit;
        }

        // 2. Handle CSV Upload
        if ( isset( $_POST['roofer_import_nonce'] ) && wp_verify_nonce( $_POST['roofer_import_nonce'], 'roofer_import_action' ) ) {
            if ( isset( $_FILES['roofer_csv_file'] ) && $_FILES['roofer_csv_file']['error'] == UPLOAD_ERR_OK ) {
                $file = $_FILES['roofer_csv_file']['tmp_name'];
                $handle = fopen( $file, 'r' );
                if ( $handle !== false ) {
                    $header = fgetcsv( $handle );
                    if ( ! $header || ! in_array( 'Title', $header ) ) {
                        wp_die( 'Invalid CSV Format. Please use the exact downloaded template.' );
                    }

                    $count = 0;
                    while ( ( $data = fgetcsv( $handle ) ) !== false ) {
                        if ( count( $header ) !== count( $data ) ) continue; // Skip broken rows
                        
                        $row = array_combine( $header, $data );
                        if ( empty( trim( $row['Title'] ) ) ) continue;

                        $post_data = [
                            'post_title'   => sanitize_text_field( $row['Title'] ),
                            'post_content' => wp_kses_post( $row['Description'] ?? '' ),
                            'post_type'    => 'roofer_project',
                            'post_status'  => 'publish',
                        ];
                        
                        $post_id = wp_insert_post( $post_data );

                        if ( $post_id && ! is_wp_error( $post_id ) ) {
                            $count++;
                            
                            // Map Categories
                            if ( ! empty( $row['Categories (comma-separated)'] ) ) {
                                $cats = array_map( 'trim', explode( ',', $row['Categories (comma-separated)'] ) );
                                wp_set_object_terms( $post_id, $cats, 'roofer_project_category' );
                            }

                            // Map Dynamic Attributes
                            $attributes_string = get_option( 'custom_project_attributes', "Location\nCompletion Date\nMaterials Used" );
                            $attributes_array = array_filter( array_map( 'trim', explode( "\n", str_replace( "\r", "", $attributes_string ) ) ) );

                            foreach ( $attributes_array as $attr ) {
                                if ( isset( $row[$attr] ) ) {
                                    $meta_key = '_project_attr_' . sanitize_title( $attr ); // Corrected meta_key prefix
                                    update_post_meta( $post_id, $meta_key, sanitize_text_field( $row[$attr] ) );
                                }
                            }
                        }
                    }
                    fclose( $handle );
                    
                    wp_redirect( admin_url( 'edit.php?post_type=roofer_project&page=roofer_project_import&imported=' . $count ) );
                    exit;
                }
            }
        }
    }

    public function render_bulk_import_page() {
        ?>
        <div class="wrap">
            <h1><?php _e( 'Bulk Import Projects', 'custom-projects' ); ?></h1>
            
            <?php if ( isset( $_GET['imported'] ) ) : ?>
                <div class="notice notice-success is-dismissible">
                    <p><strong><?php echo intval( $_GET['imported'] ); ?></strong> projects were successfully created and published!</p>
                </div>
            <?php endif; ?>

            <div class="card" style="max-width: 600px; padding: 20px; margin-top: 20px;">
                <h2>Step 1: Download Template</h2>
                <p>Download the exact CSV spreadsheet format. It will automatically include columns for every Custom Attribute you have active in the Settings.</p>
                <a href="<?php echo admin_url('admin.php?download_roofer_template=1'); ?>" class="button button-secondary">Download CSV Template</a>
            </div>

            <div class="card" style="max-width: 600px; padding: 20px; margin-top: 20px;">
                <h2>Step 2: Upload Completed CSV</h2>
                <p>Upload the filled template. The system will automatically create the projects, assign the categories, and strictly map your custom attributes into the database for Bricks Builder to read.</p>
                <form method="post" enctype="multipart/form-data">
                    <?php wp_nonce_field( 'roofer_import_action', 'roofer_import_nonce' ); ?>
                    <input type="file" name="roofer_csv_file" accept=".csv" required />
                    <br><br>
                    <input type="submit" class="button button-primary" value="Run Import Engine" />
                </form>
            </div>
        </div>
        <?php
    }

    /**
     * Add Custom Meta Boxes
     */
    public function add_custom_meta_boxes() {
        add_meta_box(
            'roofer_project_details',
            __( 'Project Attributes', 'custom-projects' ),
            [$this, 'render_details_meta_box'],
            'roofer_project',
            'normal',
            'high'
        );

        add_meta_box(
            'roofer_project_secondary_featured_image',
            __( 'Secondary Featured Image', 'custom-projects' ),
            [$this, 'render_secondary_featured_image_meta_box'],
            'roofer_project',
            'side',
            'low'
        );

        add_meta_box(
            'roofer_project_gallery',
            __( 'Project Photo Gallery', 'custom-projects' ),
            [$this, 'render_gallery_meta_box'],
            'roofer_project',
            'normal',
            'high'
        );
    }

    /**
     * Render Details Meta Box
     */
    public function render_details_meta_box( $post ) {
        wp_nonce_field( 'roofer_save_meta', 'roofer_meta_nonce' );

        $attributes_setting = get_option( 'custom_project_attributes', "Location\nCompletion Date\nMaterials Used" );
        $attributes = array_filter( array_map( 'trim', explode( "\n", $attributes_setting ) ) );

        ?>
        <style>
            .roofer-meta-field { margin-bottom: 15px; }
            .roofer-meta-field label { display: block; font-weight: bold; margin-bottom: 5px; }
            .roofer-meta-field input[type="text"] { width: 100%; max-width: 400px; }
        </style>
        <?php
        
        if ( empty( $attributes ) ) {
            echo '<p>' . __( 'No attributes defined. Go to Projects > Settings to add some.', 'custom-projects' ) . '</p>';
        } else {
            foreach ( $attributes as $attr ) {
                $meta_key = '_project_attr_' . sanitize_title( $attr );
                $value = get_post_meta( $post->ID, $meta_key, true );
                ?>
                <div class="roofer-meta-field">
                    <label for="<?php echo esc_attr( $meta_key ); ?>"><?php echo esc_html( $attr ); ?></label>
                    <input type="text" id="<?php echo esc_attr( $meta_key ); ?>" name="<?php echo esc_attr( $meta_key ); ?>" value="<?php echo esc_attr( $value ); ?>" />
                </div>
                <?php
            }
        }
    }

    /**
     * Render Secondary Featured Image Meta Box
     */
    public function render_secondary_featured_image_meta_box( $post ) {
        $image_id = get_post_meta( $post->ID, '_project_secondary_featured_image', true );
        $image_url = '';
        if ( $image_id ) {
            $image_attributes = wp_get_attachment_image_src( $image_id, 'medium' );
            if ( $image_attributes ) {
                $image_url = $image_attributes[0];
            }
        }
        ?>
        <div id="roofer-secondary-featured-image-container">
            <p class="hide-if-no-js" style="margin-top: 0;">
                <a href="#" id="roofer-upload-secondary-featured-image" style="display: <?php echo $image_id ? 'none' : 'block'; ?>;">
                    <?php _e('Set secondary featured image', 'custom-projects'); ?>
                </a>
            </p>
            <div id="roofer-secondary-featured-image-preview">
                <?php if ( $image_url ) : ?>
                    <a href="#" id="roofer-change-secondary-featured-image">
                        <img src="<?php echo esc_url( $image_url ); ?>" style="max-width: 100%; height: auto; display: block; margin-bottom: 10px;" />
                    </a>
                <?php endif; ?>
            </div>
            <input type="text" id="roofer_project_secondary_featured_image" name="roofer_project_secondary_featured_image" value="<?php echo esc_attr( $image_id ); ?>" style="display:none;" />
            <p class="hide-if-no-js" style="margin-bottom: 0;">
                <a href="#" id="roofer-remove-secondary-featured-image" style="display: <?php echo $image_id ? 'inline' : 'none'; ?>; color: #b32d2e; text-decoration: none;">
                    <?php _e('Remove secondary featured image', 'custom-projects'); ?>
                </a>
            </p>
        </div>
        <?php
    }

    /**
     * Render Gallery Meta Box
     */
    public function render_gallery_meta_box( $post ) {
        $gallery_ids = get_post_meta( $post->ID, '_project_gallery', true );
        ?>
        <div id="roofer-gallery-container">
            <ul id="roofer-gallery-list" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; list-style: none; padding: 0;">
                <?php
                if ( ! empty( $gallery_ids ) ) {
                    $ids = explode( ',', $gallery_ids );
                    foreach ( $ids as $id ) {
                        $image = wp_get_attachment_image_src( $id, 'thumbnail' );
                        if ( $image ) {
                            echo '<li style="position:relative;" data-id="' . esc_attr($id) . '">
                                    <img src="' . esc_url( $image[0] ) . '" style="max-width: 150px; height: auto; border: 1px solid #ddd; padding: 2px;" />
                                    <button class="remove-roofer-image button" style="position: absolute; top: 5px; right: 5px;">X</button>
                                  </li>';
                        }
                    }
                }
                ?>
            </ul>
            <input type="text" id="roofer_project_gallery" name="roofer_project_gallery" value="<?php echo esc_attr( $gallery_ids ); ?>" style="display:none;" />
            <a href="#" id="roofer-upload-gallery" class="button button-primary"><?php _e( 'Add/Manage Photos', 'custom-projects' ); ?></a>
            <a href="#" id="roofer-clear-gallery" class="button"><?php _e( 'Clear All', 'custom-projects' ); ?></a>
        </div>
        <?php
    }

    /**
     * Enqueue Admin Scripts for Media Uploader
     */
    public function enqueue_admin_scripts( $hook ) {
        global $typenow;
        if ( $typenow === 'roofer_project' ) {
            wp_enqueue_media();
            wp_enqueue_script( 'roofer-admin-js', plugin_dir_url( __FILE__ ) . 'admin.js', ['jquery'], time() . rand(), true );
            wp_localize_script( 'roofer-admin-js', 'roofer_ajax', [
                'nonce' => wp_create_nonce( 'roofer_ajax_nonce' )
            ] );
        }
    }

    /**
     * Save Meta Box Data
     */
    public function save_custom_meta( $post_id ) {
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }
        if ( wp_is_post_revision( $post_id ) ) {
            return;
        }
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        // Only enforce nonce check if it's explicitly submitted (bypasses Gutenberg partial save stripping)
        if ( isset( $_POST['roofer_meta_nonce'] ) && ! wp_verify_nonce( $_POST['roofer_meta_nonce'], 'roofer_save_meta' ) ) {
            return;
        }

        // Save Custom Attributes
        $attributes_setting = get_option( 'custom_project_attributes', "Location\nCompletion Date\nMaterials Used" );
        $attributes = array_filter( array_map( 'trim', explode( "\n", $attributes_setting ) ) );

        foreach ( $attributes as $attr ) {
            $meta_key = '_project_attr_' . sanitize_title( $attr );
            if ( isset( $_POST[$meta_key] ) ) {
                update_post_meta( $post_id, $meta_key, sanitize_text_field( $_POST[$meta_key] ) );
            }
        }

        // Save Secondary Featured Image
        if ( isset( $_POST['roofer_project_secondary_featured_image'] ) ) {
            update_post_meta( $post_id, '_project_secondary_featured_image', sanitize_text_field( $_POST['roofer_project_secondary_featured_image'] ) );
        }

    }

    /**
     * AJAX Background Savers
     */
    public function ajax_save_gallery() {
        check_ajax_referer( 'roofer_ajax_nonce', 'security' );
        $post_id = intval( $_POST['post_id'] );
        if ( current_user_can( 'edit_post', $post_id ) ) {
            update_post_meta( $post_id, '_project_gallery', sanitize_text_field( $_POST['gallery'] ) );
        }
        wp_send_json_success();
    }

    public function ajax_save_secondary_image() {
        check_ajax_referer( 'roofer_ajax_nonce', 'security' );
        $post_id = intval( $_POST['post_id'] );
        if ( current_user_can( 'edit_post', $post_id ) ) {
            update_post_meta( $post_id, '_project_secondary_featured_image', sanitize_text_field( $_POST['image_id'] ) );
        }
        wp_send_json_success();
    }

    /**
     * Render Custom Projects Tags (Raw Data Provider for Bricks 1.9+)
     */
    public function render_custom_projects_tag( $tag, $post, $context = 'text' ) {
        $clean_tag = str_replace( ['{', '}'], '', $tag );

        if ( ! in_array( $clean_tag, ['custom_project_gallery', 'custom_project_secondary_featured_image'] ) ) {
            return $tag;
        }

        $post_id = $post ? $post->ID : get_the_ID();
        if ( function_exists( 'bricks_get_builder_post_id' ) ) {
            $builder_post_id = bricks_get_builder_post_id();
            if ( $builder_post_id ) {
                $post_id = $builder_post_id;
            }
        }

        if ( $clean_tag === 'custom_project_secondary_featured_image' ) {
            $secondary_image_id = get_post_meta( $post_id, '_project_secondary_featured_image', true );
            if ( ! empty( $secondary_image_id ) ) {
                // Bricks native Image parser natively intercepts arrays and looks up the 'id' key specifically!
                return [ 'id' => (int) $secondary_image_id ];
            }
            return '';
        }

        if ( $clean_tag === 'custom_project_gallery' ) { // The Gallery IDs array or string
            $gallery_ids = get_post_meta( $post_id, '_project_gallery', true );
            return ! empty( $gallery_ids ) ? $gallery_ids : '';
        }

        return $tag;
    }
}

// ============================================
// 100% Fail-Proof Shortcode for Secondary Image
// ============================================
add_shortcode( 'roofer_secondary_image', function() {
    $image_id = get_post_meta( get_the_ID(), 'project_secondary_featured_image', true );
    if ( ! $image_id ) {
        return '';
    }
    // Output the EXACT HTML <img> tag with full responsive WP srcset
    return wp_get_attachment_image( $image_id, 'full', false, [
        'style' => 'width: 100%; height: 100%; object-fit: cover;',
        'class' => 'roofer-secondary-image-output'
    ] );
});

// Initialize the plugin
new Custom_Projects_Plugin();

/**
 * Register custom dynamic data tags in the Bricks Builder dropdown UI
 * This makes them clickable under the "Dynamic Data" lightning bolt icon.
 */
add_filter( 'bricks/dynamic_tags_list', 'register_custom_projects_tags' );
function register_custom_projects_tags( $tags ) {
    
    // Core Gallery Tag
    $tags[] = [
        'name'  => '{custom_project_gallery}',
        'label' => 'Project Photo Gallery',
        'group' => 'Projects',
    ];

    // Primary Featured Image (Alias for standard Bricks featured image)
    $tags[] = [
        'name'  => '{featured_image}',
        'label' => 'Primary Featured Image',
        'group' => 'Projects',
    ];

    // Secondary Featured Image
    $tags[] = [
        'name'  => '{custom_project_secondary_featured_image}',
        'label' => 'Secondary Featured Image',
        'group' => 'Projects',
    ];

    // Core - Output all as a single HTML list
    $tags[] = [
        'name'  => '{custom_project_attributes_all}',
        'label' => 'All Attributes (List)',
        'group' => 'Projects',
    ];

    // Dynamically register EVERY user-created attribute as its own tag!
    $attributes_setting = get_option( 'custom_project_attributes', "Location\nCompletion Date\nMaterials Used" );
    $attributes = array_filter( array_map( 'trim', explode( "\n", $attributes_setting ) ) );

    if ( ! empty( $attributes ) ) {
        foreach ( $attributes as $attr ) {
            // e.g. {project_attr_location}
            $clean_slug = sanitize_title( $attr );
            $tags[] = [
                'name'  => "{project_attr_{$clean_slug}}",
                'label' => esc_html( $attr ),
                'group' => 'Projects', // This will create the "Projects" dropdown category!
            ];
        }
    }

    return $tags;
}

/**
 * Render custom dynamic data tags in Bricks Builder (Text Replacements)
 */
add_filter( 'bricks/dynamic_data/render_content', 'render_custom_projects_tags', 10, 3 );
function render_custom_projects_tags( $content, $post, $context = 'text' ) {
    if ( ! is_string( $content ) || strpos( $content, '{' ) === false ) {
        return $content;
    }

    $post_id = isset( $post->ID ) ? $post->ID : get_the_ID();
    if ( function_exists( 'bricks_get_builder_post_id' ) ) {
        $builder_post_id = bricks_get_builder_post_id();
        if ( $builder_post_id ) {
            $post_id = $builder_post_id;
        }
    }

    // Render {custom_project_gallery}
    if ( strpos( $content, '{custom_project_gallery}' ) !== false ) {
        $gallery_ids = get_post_meta( $post_id, '_project_gallery', true );
        $content = str_replace( '{custom_project_gallery}', $gallery_ids, $content );
    }

    // Render {custom_project_attributes_all}
    if ( strpos( $content, '{custom_project_attributes_all}' ) !== false || strpos( $content, '{custom_project_attributes}' ) !== false ) {
        $attributes_setting = get_option( 'custom_project_attributes', "Location\nCompletion Date\nMaterials Used" );
        $attributes = array_filter( array_map( 'trim', explode( "\n", $attributes_setting ) ) );
        
        $html = '<ul class="project-attributes-list" style="list-style: none; padding: 0; margin: 0;">';
        $has_items = false;

        if ( ! empty( $attributes ) ) {
            foreach ( $attributes as $attr ) {
                $meta_key = '_project_attr_' . sanitize_title( $attr );
                $value = get_post_meta( $post_id, $meta_key, true );
                if ( ! empty( $value ) ) {
                    $html .= sprintf( '<li style="margin-bottom: 8px;"><strong>%s:</strong> %s</li>', esc_html( $attr ), esc_html( $value ) );
                    $has_items = true;
                }
            }
        }
        $html .= '</ul>';
        $final_html = $has_items ? $html : '';
        $content = str_replace( ['{custom_project_attributes_all}', '{custom_project_attributes}'], $final_html, $content );
    }

    // Render individual custom attributes dynamically (e.g. {project_attr_location})
    if ( strpos( $content, '{project_attr_' ) !== false ) {
        preg_match_all( '/\{project_attr_([a-zA-Z0-9_-]+)\}/', $content, $matches );
        
        if ( ! empty( $matches[0] ) ) {
            foreach ( $matches[0] as $index => $full_tag ) {
                $slug = $matches[1][$index];
                $meta_key = '_project_attr_' . str_replace('-', '_', $slug); // Support hyphens and underscores interchangeably
                
                // Fallback attempt for exact strict database match (Bricks sometimes alters hyphens)
                $value = get_post_meta( $post_id, $meta_key, true );
                if ( empty( $value ) ) {
                    $meta_key = '_project_attr_' . $slug;
                    $value = get_post_meta( $post_id, $meta_key, true );
                }
                
                // For cleanly formatting arrays or blanks
                $value = ! empty( $value ) ? $value : '';
                
                $content = str_replace( $full_tag, esc_html( $value ), $content );
            }
        }
    }

    return $content;
}

// ============================================
// GitHub Auto-Updater (Plugin Update Checker)
// ============================================
require plugin_dir_path( __FILE__ ) . 'plugin-update-checker/plugin-update-checker.php';

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$myUpdateChecker = PucFactory::buildUpdateChecker(
	'https://github.com/Deezty001/Wordpress-Projects-Display-Manager-', // GitHub Repository URL
	__FILE__, // Full path to the main plugin file
	'roofer-projects' // Plugin slug
);

// Optional: Set branch to monitor (defaults to 'master', if it's 'main' uncomment this)
$myUpdateChecker->setBranch('main');/**
 * Parse strings containing {custom_project_attributes}

/**
 * Shortcode to output a filterable masonry grid of projects.
 * Usage: [roofer_projects_gallery]
 */
function roofer_projects_gallery_shortcode( $atts ) {
    ob_start();
    
    // Fetch visual settings from WordPress backend
    $d_cols = esc_html(get_option('roofer_grid_desktop_cols', 3));
    $t_cols = esc_html(get_option('roofer_grid_tablet_cols', 2));
    $m_cols = esc_html(get_option('roofer_grid_mobile_cols', 1));
    $bento  = get_option('roofer_grid_bento_style', 1);
    $color  = esc_html(get_option('roofer_filter_active_color', '#09090b'));

    ?>
    <style>
        .roofer-filters { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 40px; justify-content: center; }
        .roofer-filter-btn { background: transparent; border: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; cursor: pointer; padding: 8px 16px; transition: color 0.3s ease, border-color 0.3s ease; }
        .roofer-filter-btn:hover, .roofer-filter-btn.active { color: <?php echo $color; ?>; border-bottom: 2px solid <?php echo $color; ?>; padding-bottom: 6px; }
        
        .roofer-projects-grid {
            display: grid;
            grid-template-columns: repeat(<?php echo $d_cols; ?>, minmax(0, 1fr));
            gap: 24px;
            width: 100%;
        }
        
        @media (max-width: 900px) {
            .roofer-projects-grid { grid-template-columns: repeat(<?php echo $t_cols; ?>, minmax(0, 1fr)); }
            .roofer-projects-grid .roofer-project-card:first-child { grid-column: auto !important; grid-row: auto !important; aspect-ratio: 16/9; }
        }
        @media (max-width: 600px) {
            .roofer-projects-grid { grid-template-columns: repeat(<?php echo $m_cols; ?>, minmax(0, 1fr)); }
        }

        .roofer-project-card {
            position: relative;
            background: #f4f4f5;
            overflow: hidden;
            aspect-ratio: 5/4;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: opacity 0.4s ease, transform 0.4s ease;
        }
        
        <?php if ( $bento ) : ?>
        .roofer-projects-grid .roofer-project-card:first-child {
            grid-column: span 2;
            grid-row: span 2;
        }
        <?php endif; ?>
        
        .roofer-project-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .roofer-project-card:hover .roofer-project-image {
            transform: scale(1.04);
        }
        
        .roofer-project-overlay {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
            padding: 40px 24px 24px 24px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
        }
        
        .roofer-project-title {
            color: #fff;
            margin: 0 0 6px 0;
            font-size: 22px;
            font-family: "Lato", sans-serif;
            font-weight: 700;
        }
        
        <?php if ( $bento ) : ?>
        .roofer-projects-grid .roofer-project-card:first-child .roofer-project-title {
            font-size: 36px;
        }
        <?php endif; ?>
        
        .roofer-project-cat {
            color: #d4d4d8;
            font-size: 11px;
            font-family: "Lato", sans-serif;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0;
            font-weight: 700;
        }
        .roofer-project-card.hidden { opacity: 0; transform: scale(0.95); pointer-events: none; position: absolute; }
    </style>

    <script>
    document.addEventListener("DOMContentLoaded", function() {
        const buttons = document.querySelectorAll(".roofer-filter-btn");
        const cards = document.querySelectorAll(".roofer-project-card");
        const grid = document.querySelector(".roofer-projects-grid");

        buttons.forEach(btn => {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                buttons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                
                const filter = this.getAttribute("data-filter");
                
                cards.forEach(card => {
                    const cats = card.getAttribute("data-categories").split(",");
                    if (filter === "all" || cats.includes(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                            card.style.position = 'relative';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        card.style.position = 'absolute';
                        setTimeout(() => { card.style.display = 'none'; }, 400);
                    }
                });
            });
        });
    });
    </script>
    <?php
    $terms = get_terms([
        'taxonomy' => 'roofer_project_category',
        'hide_empty' => true,
    ]);
    
    echo '<div class="roofer-gallery-shortcode-container">';
    echo '<div class="roofer-filters">';
    echo '<button class="roofer-filter-btn active" data-filter="all">All</button>';
    if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
        foreach ( $terms as $term ) {
            echo '<button class="roofer-filter-btn" data-filter="' . esc_attr( $term->slug ) . '">' . esc_html( $term->name ) . '</button>';
        }
    }
    echo '</div>';

    $query = new WP_Query([
        'post_type' => 'roofer_project',
        'posts_per_page' => -1,
        'post_status' => 'publish',
    ]);

    if ( $query->have_posts() ) {
        echo '<div class="roofer-projects-grid">';
        while ( $query->have_posts() ) {
            $query->the_post();
            
            // Get Category slugs for filtering
            $post_terms = wp_get_post_terms( get_the_ID(), 'roofer_project_category' );
            $term_slugs = [];
            $term_names = [];
            if ( ! is_wp_error( $post_terms ) ) {
                foreach ( $post_terms as $pt ) {
                    $term_slugs[] = $pt->slug;
                    $term_names[] = $pt->name;
                }
            }
            $cats_string = implode( ',', $term_slugs );
            $cats_display = implode( ', ', $term_names );
            
            // Get Primary Featured Image
            $img_url = get_the_post_thumbnail_url( get_the_ID(), 'large' );
            if ( ! $img_url ) {
                $img_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; 
            }

            echo '<a href="' . esc_url( get_permalink() ) . '" class="roofer-project-card" data-categories="' . esc_attr( $cats_string ) . '" style="text-decoration:none;">';
            echo '<img src="' . esc_url( $img_url ) . '" class="roofer-project-image" alt="' . esc_attr( get_the_title() ) . '" />';
            echo '<div class="roofer-project-overlay">';
            echo '<h3 class="roofer-project-title">' . esc_html( get_the_title() ) . '</h3>';
            echo '<p class="roofer-project-cat">' . esc_html( $cats_display ) . '</p>';
            echo '</div>';
            echo '</a>';
        }
        echo '</div>';
        wp_reset_postdata();
    } else {
        echo '<p>No projects currently available.</p>';
    }
    
    echo '</div>';

    return ob_get_clean();
}
add_shortcode( 'roofer_projects_gallery', 'roofer_projects_gallery_shortcode' );

/**
 * Parse strings containing {custom_project_attributes}
 */
add_filter( 'bricks/dynamic_data/render_content', 'render_custom_projects_content', 10, 3 );
function render_custom_projects_content( $content, $post, $context = 'text' ) {
    if ( ! is_string( $content ) ) {
        return $content;
    }

    if ( strpos( $content, '{custom_project_attributes}' ) !== false ) {
        $tag_value = render_custom_projects_tags( '{custom_project_attributes}', $post, $context );
        $content = str_replace( '{custom_project_attributes}', $tag_value, $content );
    }
    return $content;
}
