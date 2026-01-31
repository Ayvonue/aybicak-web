from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v9(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Background Color Baseline (Top-Left)
    bg_pixel = data[0, 0]
    bg_r, bg_g, bg_b = bg_pixel[0], bg_pixel[1], bg_pixel[2]
    
    # 2. Aggressive Tolerance for Noisy Background
    # The user screenshot showed lots of noise/dirt remaining.
    # Increasing tolerance significantly.
    tol = 50 
    
    mask_bg_candidate = (np.abs(r - bg_r) < tol) & \
                        (np.abs(g - bg_g) < tol) & \
                        (np.abs(b - bg_b) < tol)
    
    # 3. Robust Protection for Logo (Navy Blue & Silver)
    
    # Navy Blue Rule: Blue is significantly higher than Red/Green?
    # Or Saturation is perceptible.
    # Grey background has very low saturation (R~=G~=B).
    
    # Calculate Saturation (Max - Min channel)
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    
    # Silver parts also have low saturation, but they are BRIGHTER than the dark grey background.
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Background Characteristics:
    # 1. Low Saturation (Grey)
    # 2. Low Brightness (~40-60)
    
    # Logo Characteristics:
    # 1. Navy: High Saturation (Blue > others)
    # 2. Silver: Low Saturation BUT High Brightness (> 100)
    # 3. Handle: Black/Gold? Gold has high saturation. Black is tricky.
    
    # Protection Logic:
    # Protect if Saturation > 12 (covers Navy, Gold)
    # OR Protect if Brightness > 80 (covers Silver)
    # OR Protect if Brightness < 15 (covers deep Black details, if darker than BG)
    
    # BG brightness is likely around 40-50.
    
    mask_protected = (saturation > 12) | (brightness > 85) | (brightness < 15)
    
    # 4. Final Removal Mask
    mask_to_remove = mask_bg_candidate & (~mask_protected)
    
    # Apply
    data[mask_to_remove, 3] = 0
    
    # 5. Flood Fill cleanup for isolated noise pixels that might have survived?
    # Doing aggressive color removal is usually better for noise than flood fill.
    
    # 6. Smooth Edges
    img_processed = Image.fromarray(data)
    alpha = img_processed.split()[3]
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5))
    img_processed.putalpha(alpha)
    
    img_processed.save(output_path)
    print(f"Saved logo-v9.png to {output_path}")

clean_logo_v9(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-v9.png"
)
