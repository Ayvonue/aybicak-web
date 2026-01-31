from PIL import Image
import numpy as np

def clean_logo_advanced(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # Target Background Colors to Remove
    # 1. White
    # 2. Checkerboard patterns (light grays)
    
    # Define thresholds
    # White/Very Light Grey
    mask_light = (r > 230) & (g > 230) & (b > 230)

    # Checkerboard Grey (often around 204 or 0xCC, or various shades)
    # We'll detect pixels that are neutral (R~=G~=B) and high brightness but not white
    mask_grey = (r > 150) & (g > 150) & (b > 150) & \
                (np.abs(r - g) < 15) & (np.abs(g - b) < 15) & (np.abs(r - b) < 15)

    # Combine masks
    mask_bg = mask_light | mask_grey

    # Create new image data
    new_data = data.copy()

    # Set background pixels to transparent
    new_data[mask_bg, 3] = 0

    # Optional: Enhance text visibility if it's dark
    # Identify dark pixels (Text)
    mask_text = (new_data[:,:,3] > 0) & (new_data[:,:,0] < 50) & (new_data[:,:,1] < 60) & (new_data[:,:,2] < 80)
    
    # Change dark text to White
    new_data[mask_text, 0] = 255
    new_data[mask_text, 1] = 255
    new_data[mask_text, 2] = 255

    result = Image.fromarray(new_data)
    result.save(output_path)
    print(f"Saved cleaned logo to {output_path}")

clean_logo_advanced(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-target.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-target-clean.png"
)
