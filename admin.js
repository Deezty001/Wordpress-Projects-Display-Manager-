jQuery(document).ready(function($){
    var frame;
    var secondaryFrame;

    // Helper function to save via background AJAX instantly
    function saveGalleryAjax(galleryIds) {
        var postId = $('#post_ID').val();
        if(!postId) return;
        $.post(ajaxurl, {
            action: 'roofer_save_gallery',
            post_id: postId,
            gallery: galleryIds,
            security: roofer_ajax.nonce
        });
    }

    function saveSecondaryImageAjax(imageId) {
        var postId = $('#post_ID').val();
        if(!postId) return;
        $.post(ajaxurl, {
            action: 'roofer_save_secondary_image',
            post_id: postId,
            image_id: imageId,
            security: roofer_ajax.nonce
        });
    }

    // ============================================
    // GALLERY LOGIC
    // ============================================
    $('#roofer-upload-gallery').on('click', function(e) {
        e.preventDefault();
        if ( frame ) { frame.open(); return; }
        frame = wp.media({ title: 'Select Project Photos', button: { text: 'Use these photos' }, multiple: true });

        frame.on( 'select', function() {
            var selection = frame.state().get('selection');
            var galleryInput = $('#roofer_project_gallery');
            var imageList = $('#roofer-gallery-list');
            var currentIds = galleryInput.val() ? galleryInput.val().split(',') : [];

            selection.map(function(attachment) {
                attachment = attachment.toJSON();
                if(currentIds.indexOf(attachment.id.toString()) === -1) {
                    currentIds.push(attachment.id);
                    var imgHtml = '<li style="position:relative;" data-id="'+attachment.id+'">';
                    imgHtml += '<img src="'+ (attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url) +'" style="max-width: 150px; height: auto; border: 1px solid #ddd; padding: 2px;" />';
                    imgHtml += '<button class="remove-roofer-image button" style="position: absolute; top: 5px; right: 5px;">X</button>';
                    imgHtml += '</li>';
                    imageList.append(imgHtml);
                }
            });
            var newGalleryString = currentIds.join(',');
            galleryInput.val(newGalleryString);
            saveGalleryAjax(newGalleryString); // Bam! Saved instantly.
        });
        frame.open();
    });

    $('#roofer-gallery-list').on('click', '.remove-roofer-image', function(e) {
        e.preventDefault();
        var galleryInput = $('#roofer_project_gallery');
        var li = $(this).closest('li');
        var idToRemove = li.data('id').toString();
        var currentIds = galleryInput.val().split(',');
        var newIds = currentIds.filter(function(id) { return id !== idToRemove; });
        var newGalleryString = newIds.join(',');
        galleryInput.val(newGalleryString);
        saveGalleryAjax(newGalleryString); // Bam! Saved instantly.
        li.remove();
    });

    $('#roofer-clear-gallery').on('click', function(e) {
        e.preventDefault();
        $('#roofer_project_gallery').val('');
        saveGalleryAjax(''); // Bam! Cleared instantly.
        $('#roofer-gallery-list').empty();
    });

    // ============================================
    // SECONDARY IMAGE LOGIC
    // ============================================
    $('#roofer-upload-secondary-featured-image, #roofer-change-secondary-featured-image').on('click', function(e) {
        e.preventDefault();
        if ( secondaryFrame ) { secondaryFrame.open(); return; }
        secondaryFrame = wp.media({ title: 'Secondary Featured Image', button: { text: 'Set image' }, multiple: false });

        secondaryFrame.on( 'select', function() {
            var attachment = secondaryFrame.state().get('selection').first().toJSON();
            $('#roofer_project_secondary_featured_image').val(attachment.id);
            saveSecondaryImageAjax(attachment.id); // Bam! Saved instantly.
            var imgUrl = attachment.sizes && attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url;
            $('#roofer-secondary-featured-image-preview').html('<a href="#" id="roofer-change-secondary-featured-image"><img src="'+imgUrl+'" style="max-width: 100%; height: auto; display: block; margin-bottom: 10px;" /></a>');
            $('#roofer-upload-secondary-featured-image').hide();
            $('#roofer-remove-secondary-featured-image').show();
        });
        secondaryFrame.open();
    });

    $('#roofer-secondary-featured-image-container').on('click', '#roofer-remove-secondary-featured-image', function(e) {
        e.preventDefault();
        $('#roofer_project_secondary_featured_image').val('');
        saveSecondaryImageAjax(''); // Bam! Cleared instantly.
        $('#roofer-secondary-featured-image-preview').html('');
        $('#roofer-upload-secondary-featured-image').show();
        $(this).hide();
    });
});
