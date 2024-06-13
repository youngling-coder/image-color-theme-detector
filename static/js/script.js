// Retrieve necessary HTML elements
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const preview = document.getElementById('preview');

// Add upload file listener
fileInput.addEventListener('change', () => {

    // Clear previous image
    preview.innerHTML = '';
    
    // Check if any file is selected
    if (fileInput.files.length > 0) {

        // Make available upload button
        uploadButton.disabled = false;

        // Set first file as selected
        const file = fileInput.files[0];

        // Create file reader
        const reader = new FileReader();

        // As reader reads the image, set the image for preview
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };

        // Read the image
        reader.readAsDataURL(file);
    } else {
        
        // Set upload button disabled if no valid image was chosen
        uploadButton.disabled = true;
    }
});

uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {

        // Get host url
        const baseUrl = window.location.origin;

        const response = await fetch(`${baseUrl}/upload_image`, {
            method: 'POST',
            body: formData
            });
            
            if (response.ok) {
                const colors = await response.json();
                
                colorDisplay.innerHTML = "";
                
                for (var i = 0; i < 5; i++) {
                    let color = colors[i]["hex_"];
                    
                    // Create color item to add 
                    const color_element = document.createElement("div");
                    color_element.innerHTML = `<h4 style="color: ${color};" class="color-name">${color}</h4>`;
                    color_element.className = "color-box";
                    color_element.style.backgroundColor = color;
                    colorDisplay.appendChild(color_element);
                }
                viewer.style.background = `linear-gradient(135deg, ${colors[0]["hex_"]}99, ${colors[1]["hex_"]}99, ${colors[2]["hex_"]}99, ${colors[3]["hex_"]}99, ${colors[4]["hex_"]}99)`;

                const colorBoxes = document.querySelectorAll('.color-box');

                function rgbToHex(rgb) {
                    const rgbValues = rgb.match(/\d+/g);
                    const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
                    const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
                    const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
                    return `#${r}${g}${b}`;
                }

                colorBoxes.forEach(box => {
                    // Get the background color of the clicked element
                    const bgColor = window.getComputedStyle(box).backgroundColor;

                    // Convert the RGB color to hex
                    const hexColor = rgbToHex(bgColor).toLocaleUpperCase();

                    box.addEventListener('click', function () {

                        // Copy the hex color to clipboard using hidden textarea
                        clipboardTextarea.value = hexColor;
                        clipboardTextarea.select();
                        document.execCommand('copy');
                    });
                });
            } else {
                if (response.status == 403) {
                    alert("Selected type is not image or not supported!")
                } else {
                    alert('Unknown error! File upload failed!');
                }
        }
        
    } catch (error) {
        alert('An error occurred while uploading the file.');
    }
});
