from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v18(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Background Removal (V17 Logic)
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Background: Neutral and Dark-ish
    # But strictly protect Navy (which is NOT Neutral)
    mask_bg = (neutrality < 15) & (brightness < 90) & (brightness > 30) # Protect Black handle < 30?
    
    # Let's use the V17 refined logic
    # V17: (neutrality < 15) & (brightness > 30) & (brightness < 90)
    # This removed the box.
    
    data[mask_bg, 3] = 0
    
    # 2. Text Color Boost (Navy -> White)
    # Detect Navy Blue
    # Navy is: Blue > Red and Blue > Green.
    # And it is dark (Brightness < 100 usually).
    
    # Navy condition:
    # (Blue is dominant) AND (Not Grey) AND (Not Silver - Silver is bright)
    
    mask_navy = (b > r + 10) & (b > g + 10) & (brightness < 100) & (a > 0)
    
    # Change Navy pixels to White
    data[mask_navy, 0] = 255 # R
    data[mask_navy, 1] = 255 # G
    data[mask_navy, 2] = 255 # B
    # Alpha remains unchanged
    
    # 3. Enhance Silver Visibility?
    # Silver is usually fine, maybe boost brightness slightly if it looks dull?
    # Let's just fix the text first.
    
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

clean_logo_v18(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-white-text.png"
)
