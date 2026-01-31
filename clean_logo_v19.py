from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v19(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Background Removal (V17 Logic - Safe & Tested)
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Background: Neutral and Dark-ish
    mask_bg = (neutrality < 15) & (brightness < 90) & (brightness > 30)
    data[mask_bg, 3] = 0
    
    # 2. Text SOLIDIFICATION (The Fix)
    # The text is Navy. It looks "silik" (faded) because:
    # a) It is semi-transparent?
    # b) It has holes?
    # c) It is too dark?
    
    # Strategy: Find "Navy" pixels (even faint ones) and make them FULL OPAQUE and UNIFORM COLOR.
    
    # Navy Definition:
    # Blue is the dominant channel.
    # Not Neutral.
    # Not too bright (Silver is bright).
    
    mask_navy = (b > r + 5) & (b > g + 5) & (brightness < 120) & (data[:,:,3] > 0)
    
    # Sample a "Good" Navy Color from the image (or hardcode a nice deep navy)
    # Let's hardcode the probable original navy based on the image: ~ #1a2a40 (R=26, G=42, B=64)
    # Or measure from the mask
    
    if np.any(mask_navy):
        # Calculate mean color of existing navy pixels
        mean_r = np.mean(r[mask_navy])
        mean_g = np.mean(g[mask_navy])
        mean_b = np.mean(b[mask_navy])
        
        print(f"Detected Navy Color: R={mean_r:.1f}, G={mean_g:.1f}, B={mean_b:.1f}")
        
        # Make it slightly more vibrant/solid?
        # Let's just use the mean to be "Original" but ensure NO holes.
        
        # Apply to ALL Navy-ish pixels
        data[mask_navy, 0] = int(mean_r)
        data[mask_navy, 1] = int(mean_g)
        data[mask_navy, 2] = int(mean_b)
        data[mask_navy, 3] = 255 # FORCE FULL OPACITY
        
        # OPTIONAL: Dilate the mask to fill gaps?
        # If the text is very "eaten", we might need to expand it.
        # But let's start with Color Solidification.
        
    # 3. Auto-Crop (Standard)
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

clean_logo_v19(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-original-boosted.png"
)
