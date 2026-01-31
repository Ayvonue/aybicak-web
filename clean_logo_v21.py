from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v21(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Background Removal (Standard V17)
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    brightness = np.mean(data[:,:,:3], axis=2)
    mask_bg = (neutrality < 15) & (brightness < 90) & (brightness > 30)
    data[mask_bg, 3] = 0
    
    # 2. Text REPAIR (Morphological Closing)
    # Detection: Slightly relaxed to catch "edges" of the scratchy parts
    mask_navy_raw = (b > r) & (b > g) & (brightness < 130) & (data[:,:,3] > 0)
    
    # Convert to PIL Image for filtering
    mask_img = Image.fromarray((mask_navy_raw.astype(np.uint8) * 255))
    
    # Step A: Strong Dilation (Expand to fill gaps)
    # Size 5 = Radius 2 pixels approx.
    mask_dilated = mask_img.filter(ImageFilter.MaxFilter(5))
    
    # Step B: Mild Erosion (Shrink back to restore shape, but keep gaps closed)
    # Size 3 = Radius 1 pixel approx.
    # Net result: +1 pixel thickening, but holes filled.
    mask_closed = mask_dilated.filter(ImageFilter.MinFilter(3))
    
    mask_final_bool = np.array(mask_closed) > 128
    
    # 3. Apply Solid Color
    # Original Navy: R=14, G=29, B=43
    navy_r, navy_g, navy_b = 14, 29, 43
    
    # Protection: Do not overwrite the Silver Knife (Bright parts)
    # The mask might have expanded into the knife if they touch.
    # Knife is Bright (~180+).
    mask_safe = mask_final_bool & (brightness < 160)
    
    data[mask_safe, 0] = navy_r
    data[mask_safe, 1] = navy_g
    data[mask_safe, 2] = navy_b
    data[mask_safe, 3] = 255 # Full Opacity
    
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

clean_logo_v21(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-repair-final-v21.png"
)
