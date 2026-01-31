from PIL import Image
import numpy as np

def clean_logo_v26(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Define Reference Colors
    navy_ref = np.array([14, 29, 43]) 
    
    rgb = data[:, :, :3]
    pixel_brightness = np.mean(rgb, axis=2)
    
    # --- CLASSIFICATION (V26 REFINED) ---
    
    # 1. SILVER (Keep Original)
    # Preservation of the Metallic Icon
    mask_silver = pixel_brightness > 85
    
    # 2. NAVY / DARK LOGO PARTS (The Target)
    # User feedback: "Don't fill the holes in A or Ç".
    # This means we must be STRICTER about what we call "Logo".
    # If a pixel is slightly lighter (the gap), it must be BACKGROUND (Transparency).
    
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    r_i, g_i, b_i = r.astype(int), g.astype(int), b.astype(int)
    
    # "Blueness" (Navy Characteristic)
    # Navy (14,29,43) has score ~43.
    # Background (44,44,44) has score 0.
    # Edges/Holes will be mixed, maybe score 10-20?
    # To keep holes OPEN, we need to RAISE the threshold.
    # Previous was >6. Let's try >15. 
    # This ensures only "Very Blue" things are solid.
    
    blueness = (b_i - r_i) + (b_i - g_i)
    mask_navy_strict = (blueness > 15) & (~mask_silver) & (data[:,:,3] > 0) & (pixel_brightness < 70)
    
    # 3. BLACK DETAILS (Shadows/Handle)
    # Background is 44.
    # Handle is <20.
    # Holes in text shouldn't be black.
    mask_black_strict = (pixel_brightness < 25) & (~mask_silver) & (data[:,:,3] > 0)
    
    mask_keep_final = mask_navy_strict | mask_black_strict
    
    # --- ACTION ---
    
    # Apply Solid Navy to the 'Keep' mask
    data[mask_keep_final, 0] = navy_ref[0]
    data[mask_keep_final, 1] = navy_ref[1]
    data[mask_keep_final, 2] = navy_ref[2]
    data[mask_keep_final, 3] = 255 # FORCE FULL OPACITY
    
    # Background: Everything else
    mask_background = (~mask_silver) & (~mask_keep_final)
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

clean_logo_v26(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-detail-v26.png"
)
