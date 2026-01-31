from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v17(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Logic:
    # Background is Dark Grey (~44,44,44).
    # Logo is Navy (Blue) and Silver (Bright Grey).
    
    # 1. Neutrality (How Grey is it?)
    # Sum of absolute differences between channels. 0 = Pure Grey.
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    
    # 2. Brightness
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # 3. Saturation (For Navy)
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    
    # RULE:
    # If it is Neutral (Greyish) AND Dark -> It is Background.
    # Thresholds:
    # Neutrality < 15 (Allows slight noise)
    # Brightness < 90 (Background is ~44. Silver is usually > 100-150).
    
    mask_bg = (neutrality < 15) & (brightness < 90)
    
    # Safety Check:
    # Ensure we don't kill Navy shadows. Navy shadows have high Saturation? No, shadows are dark.
    # But Navy is NOT Neutral. Navy has Blue > Red/Green.
    # So Neutrality check protects Navy.
    
    # What about Black handle parts?
    # They are Neutral and Dark.
    # This is the risk. The handle might disappear.
    # Let's check the Handle brightness. If it's JET BLACK (< 20), we might want to keep it?
    # Background was ~44. So Black parts (<30) should be KEPT.
    
    # Refined Background Rule:
    # Neutral AND (Brightness > 30 AND Brightness < 90)
    
    mask_bg_refined = (neutrality < 15) & (brightness > 30) & (brightness < 90)
    
    data[mask_bg_refined, 3] = 0
    
    # 4. Auto-Crop (To remove the empty margins and Ensure Fit)
    # Using the same logic as V14/V15
    
    # Make temporary image to find bbox
    tmp_img = Image.fromarray(data)
    bbox = tmp_img.getbbox()
    
    if bbox:
        print(f"Cropping to {bbox}")
        tmp_img = tmp_img.crop(bbox)
        tmp_img.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Image is blank!")

clean_logo_v17(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-embedded.png"
)
