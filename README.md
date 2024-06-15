# Image Color Extractor

This FastAPI application extracts the main colors from uploaded images using the KMeans clustering algorithm. The main colors are returned in HEX format.

## Features

- Upload images in `jpg`, `jpeg`, or `png` format.
- Extract up to 5 main colors from the uploaded image.
- Display the main colors in HEX format.

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/youngling-coder/detect-image-color-theme


    cd detect-image-color-theme
    ```

2. Create and activate a virtual environment:

    ```sh
    python3 -m venv env
    source env/bin/activate  # On Windows, use `env\Scripts\activate`
    ```

3. Install the required dependencies:

    ```sh
    pip install poetry
    poetry install
    ```

## Application startup

```sh
python main.py
```
    
## API Endpoints

- **GET /**: Shows the main page where you can upload an image.
- **POST /upload_image/**: Upload an image and get the main colors in HEX format.

