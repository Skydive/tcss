ContentTools.DEFAULT_TOOLS = [
    [
        'bold',
        'italic',
        'link',
        'align-left',
        'align-center',
        'align-right'
    ], [
        'heading',
        'subheading',
        'paragraph',
        'unordered-list',
        'ordered-list',
        'table',
        'indent',
        'unindent',
        'line-break'
    ], [
        'image',
        'video',
        'preformatted'
    ], [
        'remove',
        'undo',
        'redo',
    ]
];
ContentTools.StylePalette.add([
    new ContentTools.Style('Circle', 'circle', ['img']),
    new ContentTools.Style('Border', 'border', ['img'])
]);

function imageUploader(dialog) {
     var image, xhr, xhrComplete, xhrProgress;
     dialog.addEventListener('imageuploader.cancelupload', function () {
        // Cancel the current upload

        // Stop the upload
        if (xhr) {
            xhr.upload.removeEventListener('progress', xhrProgress);
            xhr.removeEventListener('readystatechange', xhrComplete);
            xhr.abort();
        }

        // Set the dialog to empty
        dialog.state('empty');
    });
   dialog.addEventListener('imageuploader.fileready', function (ev) {

        // Upload a file to the server
        var formData;
        var file = ev.detail().file;

        // Define functions to handle upload progress and completion
        xhrProgress = function (ev) {
            // Set the progress for the upload
            dialog.progress((ev.loaded / ev.total) * 100);
        }

        xhrComplete = function (ev) {
            var response;

            // Check the request is complete
            if (ev.target.readyState != 4) {
                return;
            }

            // Clear the request
            xhr = null
            xhrProgress = null
            xhrComplete = null

            // Handle the result of the upload
            if (parseInt(ev.target.status) == 200) {
                // Unpack the response (from JSON)
                response = JSON.parse(ev.target.responseText);

                // Store the image details
                image = {
                    size: response.size,
                    url: response.url
                    };

                // Populate the dialog
                console.log(dialog);
                //dialog.populate(image.url, image.size);
                console.log(image.size);
                dialog.save(image.url, image.size,{ 'alt': 'custom image...', 'data-ce-max-width': "600" });

            } else {
                // The request failed, notify the user
                new ContentTools.FlashUI('no');
            }
        }

        // Set the dialog state to uploading and reset the progress bar to 0
        dialog.state('uploading');
        dialog.progress(0);

        // Build the form data to post to the server
        formData = new FormData();
        formData.append('image', file);
        formData.append('action', 'ct_image_upload');

        // Make the request
        xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', xhrProgress);
        xhr.addEventListener('readystatechange', xhrComplete);
        xhr.open('POST', '/php/index.php', true);
        xhr.send(formData);
    });
    // Set up the event handlers
}
ContentTools.IMAGE_UPLOADER = imageUploader;
