from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def make_logo_red_v2(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Target: The Dark Grey Box Background (~44,44,44)
    bg_pixel = data[0, 0]
    bg_r, bg_g, bg_b = bg_pixel[0], bg_pixel[1], bg_pixel[2]
    
    # Aggressive Tolerance
    tol = 55
    mask_bg = (np.abs(data[:,:,0] - bg_r) < tol) & \
              (np.abs(data[:,:,1] - bg_g) < tol) & \
              (np.abs(data[:,:,2] - bg_b) < tol)
    
    # Protection (Navy/Silver)
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    brightness = np.mean(data[:,:,:3], axis=2)
    mask_protected = (saturation > 12) | (brightness > 85) | (brightness < 15)
    
    # Final Mask to Paint Red
    mask_paint = mask_bg & (~mask_protected)
    
    final_data = data.copy()
    
    # Paint Red (255, 0, 0, 255)
    final_data[mask_paint, 0] = 255
    final_data[mask_paint, 1] = 0
    final_data[mask_paint, 2] = 0
    final_data[mask_paint, 3] = 255
    
    res = Image.fromarray(final_data)
    res.save(output_path)
    print(f"Saved {output_path}")

make_logo_red_v2(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\test-red-logo-v2.png"
)
