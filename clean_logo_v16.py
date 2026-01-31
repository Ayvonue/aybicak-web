from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v16(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # 1. SMART CROP (Remove Outer Margins) - Same as V10
    data = np.array(img)
    bg_pixel = data[0, 0]
    bg_r, bg_g, bg_b = bg_pixel[0], bg_pixel[1], bg_pixel[2]
    
    # Diff from background
    diff = np.abs(data[:,:,0] - bg_r) + np.abs(data[:,:,1] - bg_g) + np.abs(data[:,:,2] - bg_b)
    mask_content = (diff > 40)
    
    rows = np.any(mask_content, axis=1)
    cols = np.any(mask_content, axis=0)
    
    if np.any(rows) and np.any(cols):
        ymin, ymax = np.where(rows)[0][[0, -1]]
        xmin, xmax = np.where(cols)[0][[0, -1]]
        
        # Padding
        padding = 5
        ymin = max(0, ymin - padding)
        ymax = min(data.shape[0], ymax + padding)
        xmin = max(0, xmin - padding)
        xmax = min(data.shape[1], xmax + padding)
        
        print(f"Cropping to: {xmin},{ymin} - {xmax},{ymax}")
        img = img.crop((xmin, ymin, xmax, ymax))
        data = np.array(img) # Update data for cleaning phase
    
    # 2. CLEANING (Solid Grey Removal)
    # Re-read BG color from new data's corner just in case, or stick to known grey.
    # The source is the Dark Grey Box image. BG is ~44,44,44.
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Aggressive Tolerance for that noisy grey
    tol = 55
    
    # BG target (using the logic that worked in V11/V9)
    # We use the 'bg_pixel' we sampled earlier or just the corner of this crop?
    # Crop might have content in corner. Let's use the sampled 'bg_pixel' from original image.
    
    mask_to_remove = (np.abs(r - bg_r) < tol) & \
                     (np.abs(g - bg_g) < tol) & \
                     (np.abs(b - bg_b) < tol)
    
    # Protection
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Strict Protection
    mask_protected = (saturation > 12) | (brightness > 85) | (brightness < 15)
    
    mask_final = mask_to_remove & (~mask_protected)
    
    data[mask_final, 3] = 0
    
    # 3. Soften Edges
    ret = Image.fromarray(data)
    alpha = ret.split()[3]
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5))
    ret.putalpha(alpha)
    
    ret.save(output_path)
    print(f"Saved logo-v16-restored.png to {output_path}")

clean_logo_v16(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-v16-restored.png"
)
