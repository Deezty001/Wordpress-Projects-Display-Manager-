/**
 * Bricks Editor Integration Script
 * Adds "Save to Vault" functionality to the Bricks toolbar.
 */
(function($) {
    $(document).on('bricks/builder/ready', function() {
        console.log('Bricks Vault Connector Ready');

        // Add "Save to Vault" Button to Toolbar
        const $toolbar = $('.bricks-toolbar-left');
        const $saveBtn = $('<button type="button" class="bricks-vault-save-btn" title="Save to Vault">' +
                            '<span class="dashicons dashicons-cloud-upload"></span>' +
                          '</button>');

        $saveBtn.css({
            'background': '#3b82f6',
            'color': '#fff',
            'border': 'none',
            'width': '32px',
            'height': '32px',
            'border-radius': '6px',
            'margin-left': '10px',
            'cursor': 'pointer',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'transition': 'all 0.2s'
        }).hover(function() {
            $(this).css('background', '#2563eb');
        }, function() {
            $(this).css('background', '#3b82f6');
        });

        $toolbar.append($saveBtn);

        // Click Event: Show Popup
        $saveBtn.on('click', function() {
            const title = prompt('Enter Template Title:', 'My New Section');
            if (!title) return;

            const category = prompt('Enter Category:', 'Uncategorized');
            
            // Grab the current page content from Bricks
            // Bricks provides an internal data object for the builder
            const bricksData = window.bricksData?.content || {}; 
            
            $(this).prop('disabled', true).css('opacity', '0.5');

            $.ajax({
                url: bricksVaultSettings.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'vault_save_template',
                    nonce: bricksVaultSettings.nonce,
                    title: title,
                    category: category,
                    content: JSON.stringify(bricksData)
                },
                success: function(response) {
                    if (response.success) {
                        alert('✅ Template saved to Vault successfully!');
                    } else {
                        alert('❌ Error: ' + response.data);
                    }
                },
                error: function() {
                    alert('❌ Server error. Please check your connection.');
                },
                complete: function() {
                    $saveBtn.prop('disabled', false).css('opacity', '1');
                }
            });
        });
    });
})(jQuery);
