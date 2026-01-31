from PIL import Image, ImageFilter, ImageChops
import numpy as np

def clean_logo_v30(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # 1. CLEAN BACKGROUND (High-Res Source Logic V28)
    # We use the known background colors from V28 analysis to be safe
    # But dynamic sampling is better.
    
    # Sample borders
    top_row = data[0, :, :3]
    left_col = data[:, 0, :3]
    unique_border = np.unique(np.vstack((top_row, left_col)), axis=0)
    
    # Create Background Mask
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    background_mask = np.zeros(data.shape[:2], dtype=bool)
    tolerance = 15
    
    for color in unique_border:
        if np.max(color) - np.min(color) < 20: # Neutral/Grey
             diff = np.abs(r - int(color[0])) + np.abs(g - int(color[1])) + np.abs(b - int(color[2]))
             background_mask |= (diff < tolerance)
             
    data[background_mask, 3] = 0
    
    # Create the "Clean Original" Image
    img_clean = Image.fromarray(data)
    
    # 2. CREATE GLOW LAYER
    # To fix visibility on Dark Background:
    # We need a White Glow BEHIND the Navy Text.
    
    # Identify alpha channel
    alpha = img_clean.split()[3]
    
    # Create a solid white image with the same alpha shape
    glow_base = Image.new("RGBA", img_clean.size, (255, 255, 255, 0))
    glow_base.paste((200, 200, 200, 255), mask=alpha) # Silver/White Glow
    
    # Dilate slightly to make it stick out
    # 1 or 2 pixels dilation
    # Since we can't easily dilate RGBA, we dilate the mask
    mask_glow = alpha.filter(ImageFilter.MaxFilter(5)) # Radius 2
    
    # Blur the mask for "Glow" effect
    mask_glow = mask_glow.filter(ImageFilter.GaussianBlur(2))
    
    # Apply this glow mask to the white color
    glow_layer = Image.new("RGBA", img_clean.size, (255, 255, 255, 0))
    glow_layer.putalpha(mask_glow)
    
    # 3. COMPOSITE
    # Put Glow BEHIND Original
    # Structure: [Bottom: Glow] -> [Top: Original]
    
    final_img = Image.alpha_composite(glow_layer, img_clean)
    
    # 4. AUTO CROP
    bbox = final_img.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        final_img = final_img.crop(bbox)
        final_img.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

# Use the High-Res Source
input_file = r"C:/Users/large/.gemini/antigravity/brain/c599f0d1-ffa9-420f-b5ff-6f997452a336/uploaded_media_1_1769863184719.png"
output_file = r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-glow-v30.png"

clean_logo_v30(input_file, output_file)
