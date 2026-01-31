from PIL import Image
import numpy as np

def clean_logo_v15(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # 1. FIND CONTENT (Colorful/Detailed Logo)
    # Background is Checkerboard (Grey/White blocks). Low Saturation.
    # Logo is Navy and Metallic.
    
    # Calculate Saturation
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    # Calculate Brightness
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Logo Mask: High Saturation (> 15) OR Very Dark (< 40)
    # Silver highlight (Brightness > 220) might be confused with white background square.
    # But Silver highlight is usually neighbor to Navy.
    # Connectivity is key, but let's try simple bounding box of "High Saturation or Dark".
    
    mask_content = (saturation > 15) | (brightness < 40)
    
    rows = np.any(mask_content, axis=1)
    cols = np.any(mask_content, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("Error: Could not find content!")
        return
        
    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    
    # Add generous padding to include silver edges that might have low saturation
    pad = 20
    ymin = max(0, ymin - pad)
    ymax = min(data.shape[0], ymax + pad)
    xmin = max(0, xmin - pad)
    xmax = min(data.shape[1], xmax + pad)
    
    print(f"Smart Cropping to: ({xmin},{ymin}) - ({xmax},{ymax})")
    
    # Crop
    img_cropped = img.crop((xmin, ymin, xmax, ymax))
    data_cropped = np.array(img_cropped)
    
    # 2. REMOVE CHECKERBOARD (Strictly) from the crop
    # Checkerboard colors (Neutral)
    r, g, b, a = data_cropped[:, :, 0], data_cropped[:, :, 1], data_cropped[:, :, 2], data_cropped[:, :, 3]
    
    mask_neutral = (np.abs(r - g) < 8) & (np.abs(g - b) < 8) & (np.abs(r - b) < 8)
    
    # Protection again (on the crop)
    sat_crop = np.max(data_cropped[:,:,:3], axis=2) - np.min(data_cropped[:,:,:3], axis=2)
    bri_crop = np.mean(data_cropped[:,:,:3], axis=2)
    
    mask_protected = (sat_crop > 12) | (bri_crop < 40)
    # What about Silver Highlights? They are Neutral and Light.
    # Since we cropped tight, simpler to protect "Not Background".
    # Background is usually specific discrete values.
    # But let's stick to "Remove Neutral & Unprotected".
    
    mask_remove = mask_neutral & (~mask_protected)
    
    data_cropped[mask_remove, 3] = 0
    
    # Save
    res = Image.fromarray(data_cropped)
    res.save(output_path)
    print(f"Saved {output_path}")

clean_logo_v15(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-ai-clean.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-perfect-fit.png"
)
