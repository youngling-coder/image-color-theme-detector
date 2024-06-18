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

            // Set the background image for the preview background
            background.style.backgroundImage = `url(${e.target.result})`;
            background.style.backgroundSize = 'cover';
            background.style.backgroundRepeat = 'no-repeat';    
            background.style.backgroundPosition = 'center';
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

    const loadingImage = document.querySelector(".loading-image");
    
    try {

        // Unhide loading animation
        loadingImage.classList.remove("visually-hidden");

        // Get host url
        const baseUrl = window.location.origin;

        // Fetch data from the server
        const response = await fetch(`${baseUrl}/upload_image`, {
            method: 'POST',
            body: formData
        });
        
        // Retrieve response from the server
        const resultColors = await response.json();
            
        if (response.ok) {
            
            // Reset main colors
            colorDisplay.innerHTML = "";
            
            // Add new main colors
            for (var i = 0; i < 5; i++) {
                let color = resultColors[i]["hex_"];
                
                // Create color item to add 
                const color_element = document.createElement("div");
                color_element.innerHTML = `<h4 style="color: ${color};" class="color-name">${color}</h4>`;
                color_element.className = "color-box";
                color_element.style.backgroundColor = color;

                // Add color to the HTML code
                colorDisplay.appendChild(color_element);
            }
            
            // Function converts rgb(a, b, c) color string to #123456 format
            function rgbToHex(rgb) {
                const rgbValues = rgb.match(/\d+/g);
                const r = parseInt(rgbValues[0]).toString(16).padStart(2, '0');
                const g = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
                const b = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        
            // Get colornames of the color boxes
            const colorNames = document.querySelectorAll('.color-name');
            
            const changeText = (name, newText) => {

                // Change text of the color box colorname
                name.classList.remove("fade-in");
                name.classList.add("fade-out");
                
                setTimeout(() => {
                    name.innerHTML = `${newText}`;
                    name.classList.remove("fade-out");
                    name.classList.add("fade-in");
                }, 200);
            };


            colorNames.forEach(name => {

                // Get HEX color representation of the color box
                const color = name.innerHTML;

                // Add event listener when mouse leaves the element
                name.addEventListener('mouseout', function () {
                    changeText(name, color);
                });

                // Add event listener when mouse enters the element
                name.addEventListener('mouseover', function () {
                    changeText(name, "Copy");
                });

                // Add event listener when user clicks the element
                name.addEventListener('click', function () {

                    // Copy the hex color to clipboard using hidden textarea
                    clipboardTextarea.value = color;
                    clipboardTextarea.select();
                    document.execCommand('copy');
                    changeText(name, "Copied!");
                });
            });

        } else {
            if (response.status == 415) {
                alert(resultColors.detail);
            } else {
                alert(`Unknown error! File upload failed! Error code: ${response.status}`);
            }
        }
        
    } catch (error) {
        alert('An error occurred while uploading the file.');
    } finally {
        // Hide loading animation
        loadingImage.classList.add("visually-hidden");
    }
});
