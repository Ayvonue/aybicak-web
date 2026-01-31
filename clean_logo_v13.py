from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v13(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # 1. Analyze Checkerboard Colors
    # Top-Left is one square color. (0,0)
    # Next square is likely at (0, 20) or (20,0).
    
    c1 = data[0,0] # Color 1 (e.g., Dark Square)
    print(f"Checker Color 1: {c1}")
    
    # Scan diagonal to find Color 2
    c2 = None
    for i in range(1, 50):
        if np.any(np.abs(data[i,i] - c1) > 10):
            c2 = data[i,i]
            break
    print(f"Checker Color 2: {c2}")
    
    if c2 is None:
        c2 = c1 # Just in case it's solid color
        
    # 2. Protection Mask (Logo)
    # Navy Blue -> High Saturation
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    # Silver -> High Brightness (> 200 ???) OR specific metallic hue.
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Protect Saturation > 10 (Navy)
    # Protect Brightness > 240 (Very bright silver highlights)
    # Protect Brightness < 30 (Very dark details)
    
    # Checkerboard squares are usually mid-grey (70-80) and lighter grey (150-180).
    # If AI made them 255 (White), they are harder to distinguish from silver highlight.
    
    mask_protected = (saturation > 12) | (brightness > 245) | (brightness < 20)
    
    # 3. Removal Logic
    # Remove pixels close to Color 1 OR Color 2
    tol = 30
    
    mask_c1 = (np.abs(data[:,:,0] - c1[0]) < tol) & \
              (np.abs(data[:,:,1] - c1[1]) < tol) & \
              (np.abs(data[:,:,2] - c1[2]) < tol)
              
    mask_c2 = (np.abs(data[:,:,0] - c2[0]) < tol) & \
              (np.abs(data[:,:,1] - c2[1]) < tol) & \
              (np.abs(data[:,:,2] - c2[2]) < tol)
              
    mask_remove = (mask_c1 | mask_c2) & (~mask_protected)
    
    # Apply Removal
    data[mask_remove, 3] = 0
    
    # 4. Clean up "speckles" using simple morphology (erosion/dilation) or just blur alpha?
    # Let's trust the color mask first.
    
    # 5. Flood Fill from "Transparent" areas to catch any remaining islands?
    # Since we set Alpha=0, those areas are now transparent.
    
    # Save
    res = Image.fromarray(data)
    res.save(output_path)
    print(f"Saved {output_path}")

clean_logo_v13(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-ai-clean.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-ultimate-transparent.png"
)
