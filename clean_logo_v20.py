from PIL import Image, ImageDraw, ImageFilter
import numpy as np


def clean_logo_v20(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Background Removal (V17 Logic)
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    brightness = np.mean(data[:,:,:3], axis=2)
    mask_bg = (neutrality < 15) & (brightness < 90) & (brightness > 30)
    data[mask_bg, 3] = 0
    
    # 2. Text REPAIR (Dilation)
    # Identify faint Navy pixels
    # Lenient condition to catch "scratchy" parts
    mask_navy_faint = (b > r) & (b > g) & (brightness < 120) & (data[:,:,3] > 0)
    
    # We need to EXPAND/THICKEN this mask.
    # Use scipy or manual dilation. Manual 3x3 is easy with max filter (on boolean).
    # Since we don't have scipy in standard env sometimes, let's use PIL MaxFilter on a mask image.
    
    mask_img = Image.fromarray(mask_navy_faint.astype(np.uint8) * 255)
    # Dilation = MaxFilter
    # Size 3 means 1 pixel expansion in all directions (3x3 kernel)
    mask_dilated_img = mask_img.filter(ImageFilter.MaxFilter(3)) 
    
    mask_dilated = np.array(mask_dilated_img) > 128
    
    # 3. Apply Solid Color to Dilated Mask
    # Optimal Navy Color from V19: R=14, G=29, B=43
    navy_r, navy_g, navy_b = 14, 29, 43
    
    # Only apply where we are not overwriting the Silver Knife (which is bright)
    # Ensure we don't draw over the icon.
    # Icon is Bright Silver. Text is Dark.
    # So if the existing pixel is BRIGHT (>150), DO NOT overwrite it.
    
    mask_safe_to_paint = mask_dilated & (brightness < 150)
    
    data[mask_safe_to_paint, 0] = navy_r
    data[mask_safe_to_paint, 1] = navy_g
    data[mask_safe_to_paint, 2] = navy_b
    data[mask_safe_to_paint, 3] = 255 # Solid Opaque
    
    # 4. Auto-Crop
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

clean_logo_v20(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-repair-v20.png"
)
