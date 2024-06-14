import os
import io
import socket

from fastapi import FastAPI, File, UploadFile, HTTPException, Request, status
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from PIL import Image
import uvicorn
import numpy as np
from schemas import HEXColor


# Set up templates directory
templates = Jinja2Templates(directory="templates")

# Create an instance of the main FatsAPI application
app = FastAPI(description="Main application")

# Mount the static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Define upload directory path
UPLOAD_DIRECTORY = "uploads"

# Define the image extensions that are supported by the application
SUPPORTED_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
]

# Create upload directory if it does not exists
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


def get_main_image_colors(image: Image):
    """
    Converts an image to the numpy array and calculates most used colors for it
    """

    # Convert image to the numpy array
    image_array = np.array(image)

    # Handle transparency by removing fully transparent pixels
    if image_array.shape[2] == 4:
        mask = image_array[:, :, 3] > 0  # Only keep non-transparent pixels
        image_array = image_array[mask]
        image_array = image_array[:, :3]  # Discard the alpha channel

    # Get pixels from image array
    pixels = image_array.reshape(-1, 3)

    # Normalize the pixel values
    pixels = pixels / 255.0

    # Set maximum colors to detect
    maximum_colors_to_find = 5  # default, can be changed

    # Use KMeans to find main colors
    kmeans = KMeans(n_clusters=maximum_colors_to_find, random_state=435)
    kmeans.fit(pixels)
    main_colors = kmeans.cluster_centers_ * 255
    main_colors = main_colors.astype(int).tolist()

    # Sort main colors for better visualisation
    main_colors = sorted(main_colors)

    for i in range(len(main_colors)):
        rgb = [
            hex(int(main_colors[i][0]))[2:],
            hex(int(main_colors[i][1]))[2:],
            hex(int(main_colors[i][2]))[2:],
        ]

        # Convert colors to hex interpretation       
        for j in range(len(rgb)):
            if len(rgb[j]) == 1:
                rgb[j] = f"0{rgb[j]}"

        # Combine all chanels to one hex string
        color_str = (f"#{rgb[0]}" + f"{rgb[1]}" + f"{rgb[2]}").upper()


        # Convert hex color interpretation to pydantic model
        main_colors[i] = HEXColor(hex_=color_str)

    # Return main colors
    return main_colors


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """
    Shows main page to the user
    """

    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/upload_image/", response_model=list[HEXColor])
async def upload_image(file: UploadFile = File(...)):

    # Get file extension
    file_extension = os.path.splitext(file.filename)[1]

    # Raise exception when the image format is not supported
    if file_extension.lower()[1:] not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type! Supported file extensions are: " \
            f"{", ".join([file_ext for file_ext in SUPPORTED_EXTENSIONS])}",
        )

    # Read image data as bytes
    image_bytes = await file.read()

    # Create image object from bytes
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # Calculate mean color for the image
    main_colors = get_main_image_colors(image=image)

    return main_colors


if __name__ == "__main__":

    # Get machine IP address
    IP_ADDRESS = socket.gethostbyname(socket.gethostname())
    
    # Run the application
    uvicorn.run("main:app", host=IP_ADDRESS, reload=True)
