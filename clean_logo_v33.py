from PIL import Image, ImageEnhance
import numpy as np

def clean_logo_v33(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    height, width = data.shape[:2]
    
    # 1. ANALYZE BORDER TO DEFINE "BACKGROUND"
    border_pixels = []
    # Sample more points to be safe
    for x in range(0, width, 10):
        border_pixels.append(tuple(data[0, x, :3]))
        border_pixels.append(tuple(data[height-1, x, :3]))
    for y in range(0, height, 10):
        border_pixels.append(tuple(data[y, 0, :3]))
        border_pixels.append(tuple(data[y, width-1, :3]))
        
    border_arr = np.array(list(set(border_pixels)))
    
    # Calculate stats
    b_means = np.mean(border_arr, axis=1)
    min_bg_bright = np.min(b_means) - 15
    max_bg_bright = np.max(b_means) + 15
    
    print(f"BG Brightness Range: {min_bg_bright:.1f} - {max_bg_bright:.1f}")
    
    # 2. DEFINE GLOBAL BACKGROUND MASK
    # We remove ALL pixels that match the Background Signature.
    # Signature: 
    #   1. Brightness is within Range (handles Light/Dark tiles)
    #   2. Low Saturation (Grey)
    
    r, g, b = data[:,:,0].astype(int), data[:,:,1].astype(int), data[:,:,2].astype(int)
    brightness = (r + g + b) / 3
    saturation = np.maximum(np.abs(r-g), np.maximum(np.abs(g-b), np.abs(b-r)))
    
    # "Grey Check": Saturation < 20
    is_grey = saturation < 25
    
    # "Brightness Check"
    is_bg_bright = (brightness >= min_bg_bright) & (brightness <= max_bg_bright)
    
    # "Safety Check": Do NOT remove very bright Silver pixels (> 180)
    # Even if they are grey.
    # The max_bg_bright should handle this, but let's be explicit.
    not_super_bright = brightness < 170
    
    # Combined Mask
    mask_remove = is_bg_bright & is_grey & not_super_bright
    
    count_removed = np.sum(mask_remove)
    print(f"Removing {count_removed} pixels globally (including holes in B).")
    
    # 3. APPLY TRANSPARENCY
    data[mask_remove, 3] = 0
    
    # 4. VISIBILITY BOOST (Brightness 1.3x)
    img_clean = Image.fromarray(data)
    enhancer = ImageEnhance.Brightness(img_clean)
    img_bright = enhancer.enhance(1.3)
    
    # 5. AUTO CROP
    bbox = img_bright.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_final = img_bright.crop(bbox)
        img_final.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

# Use High-Res Source
input_file = r"C:/Users/large/.gemini/antigravity/brain/c599f0d1-ffa9-420f-b5ff-6f997452a336/uploaded_media_1_1769863184719.png"
output_file = r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-final-v33.png"

clean_logo_v33(input_file, output_file)
