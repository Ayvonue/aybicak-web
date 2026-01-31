from PIL import Image
import numpy as np

def crop_transparent_logo(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # Get the bounding box of non-zero alpha pixels
    bbox = img.getbbox()
    
    if bbox:
        print(f"Original Size: {img.size}")
        print(f"Cropping to BBox: {bbox}")
        # Crop
        img_cropped = img.crop(bbox)
        img_cropped.save(output_path)
        print(f"Saved cropped logo to {output_path}")
    else:
        print("Error: Image is completely transparent!")

crop_transparent_logo(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-ultimate-transparent.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-final-cropped.png"
)
