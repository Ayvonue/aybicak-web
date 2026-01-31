from PIL import Image
import numpy as np

def clean_logo_v25(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Define Reference Colors
    # 1. Background (Dark Grey)
    bg_ref = np.array([44, 44, 44])
    
    # 2. Navy Blue (Target Color)
    navy_ref = np.array([14, 29, 43]) 
    
    # 3. Silver (Bright) - We don't replace this, we just protect it.
    
    # Extract RGB channels
    rgb = data[:, :, :3]
    
    # --- PIXEL CLASSIFICATION ---
    
    # 1. Detect SILVER (Keep Original)
    # Brightness > 100 is usually Silver/White parts.
    # Navy is much darker (~30). Background is ~44.
    pixel_brightness = np.mean(rgb, axis=2)
    mask_silver = pixel_brightness > 90
    
    # 2. Detect NAVY vs BACKGROUND (For the dark pixels)
    # Ideally, Navy has "Blue Dominance".
    # simple metric: (Blue - Red) + (Blue - Green)
    # If this is positive and high, it's definitely Navy.
    # If it's near zero, it's Grey (Background).
    
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    
    # Calculate "Blueness" score
    # Use signed integers to avoid overflow wrapping
    r_i, g_i, b_i = r.astype(int), g.astype(int), b.astype(int)
    blueness = (b_i - r_i) + (b_i - g_i)
    
    # Metric: Distance to Background vs Distance to Navy
    # But Background (44,44,44) and Navy (14,29,43) are VERY close.
    # Blueness is the key differentiator.
    
    # Background Blueness is ~0.
    # Navy Blueness is (43-14) + (43-29) = 29 + 14 = 43.
    
    # Threshold: If Blueness > 5, it is NAVY.
    # Also, it must not be Silver.
    
    # ALSO: Some parts of the text might be very dark (blackish).
    # If it's close to Black (<20), it's probably part of the logo (handle or shadow).
    # Background is 44. So <20 is safe to keep.
    
    mask_navy_detected = (blueness > 6) & (~mask_silver) & (data[:,:,3] > 0)
    
    # Handle/Shadows (Black parts)
    mask_black = (pixel_brightness < 25) & (~mask_silver) & (data[:,:,3] > 0)
    
    # Combined "Logo Dark Parts"
    mask_keep_dark = mask_navy_detected | mask_black
    
    # --- ACTION ---
    
    # 1. SILVER: Do nothing (Keep original pixels).
    # 2. NAVY/DARK: Replace with SOLID NAVY to fix "faintness".
    #    (Even if it was black, making it Navy unifies the look, or we can keep black. 
    #     User wants "Navy part of crescent fixed". Usually it's same navy.)
    
    # Apply Solid Navy to the 'Keep Dark' mask
    data[mask_keep_dark, 0] = navy_ref[0]
    data[mask_keep_dark, 1] = navy_ref[1]
    data[mask_keep_dark, 2] = navy_ref[2]
    data[mask_keep_dark, 3] = 255 # FORCE FULL OPACITY
    
    # 3. BACKGROUND: Everything else.
    # (Not Silver) AND (Not Navy/Dark)
    mask_background = (~mask_silver) & (~mask_keep_dark)
    
    data[mask_background, 3] = 0
    
    # --- AUTO CROP ---
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

clean_logo_v25(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-professional-v25.png"
)
