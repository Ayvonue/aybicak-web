from PIL import Image
import numpy as np

def clean_logo_v27(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # 1. ANALYZE CHECKERBOARD
    # The image likely has a grey/dark grey checkerboard.
    # We need to sample it.
    # Let's assume the top-left pixel is background.
    bg_color_1 = data[0, 0]
    # And a pixel slightly offset is the other tile.
    bg_color_2 = data[0, 20] # 20px right
    
    print(f"Sampled BG Colors: {bg_color_1}, {bg_color_2}")
    
    # Create mask for these background colors
    # Use a small tolerance
    tol = 10
    
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    
    # Diff to Color 1
    diff1 = np.abs(r - bg_color_1[0]) + np.abs(g - bg_color_1[1]) + np.abs(b - bg_color_1[2])
    mask1 = diff1 < tol
    
    # Diff to Color 2
    diff2 = np.abs(r - bg_color_2[0]) + np.abs(g - bg_color_2[1]) + np.abs(b - bg_color_2[2])
    mask2 = diff2 < tol
    
    # Combined Background Mask
    mask_bg = mask1 | mask2
    
    # 2. APPLY TRANSPARENCY
    data[mask_bg, 3] = 0
    
    # 3. SOLIDIFY NAVY (Optional but recommended for consistency)
    # The user liked the "Solid" look, just wanted details.
    # This new source has details.
    # Let's first just CLEAN it. If it's already solid, great.
    # If not, we can solidify LATER.
    # Let's save the "Clean Raw" version first.
    
    # Actually, let's just ensure full opacity for non-bg pixels
    # (data[~mask_bg, 3] = 255) might destroy anti-aliasing.
    # Let's KEEP original alpha/anti-aliasing for now strictly.
    # The user complained about "silik" before.
    # If this high-res image is good quality, we shouldn't mess with it too much.
    
    # 4. AUTO CROP
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

# Use the SECOND uploaded image (the "Original")
input_file = r"C:/Users/large/.gemini/antigravity/brain/c599f0d1-ffa9-420f-b5ff-6f997452a336/uploaded_media_1_1769863184719.png"
output_file = r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-hq-v27.png"

clean_logo_v27(input_file, output_file)
