from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v12(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Protection Mask (The Logo)
    # The logo is Navy Blue and Metallic Silver/Black.
    # The Checkerboard is Light Grey and White.
    
    # Calculate Saturation (Colorfulness)
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    # Calculate Brightness
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Protect if Colorful (Navy) -> Saturation > 10
    # Protect if very Dark (Black handle/shadows) -> Brightness < 50
    # Protect if Metallic Gradient? 
    # The checkerboard is FLAT blocks of color. The logo is detailed.
    # But color-based is easier.
    
    mask_protected = (saturation > 10) | (brightness < 80)
    
    # 2. Removal Mask (The Checkerboard)
    # Checkerboard colors in screenshot seem to be:
    # 1. Darker Grey square (~100-120?) OR (~204?)
    # 2. Lighter Grey/White square
    
    # Let's sample Top-Left pixel to be sure what the "Grey" square is.
    bg_sample = data[0,0]
    print(f"Top-Left Sample: {bg_sample}")
    
    # Also sample a pixel slightly offset (10,10) to maybe find the other square color?
    bg_sample_2 = data[0, 10]
    print(f"Offset Sample: {bg_sample_2}")
    
    # Since we can't see the exact pixel value during coding, let's use a "Neutral & Light" rule.
    # Checkerboard is always Neutral (R=G=B).
    mask_neutral = (np.abs(r - g) < 5) & (np.abs(g - b) < 5) & (np.abs(r - b) < 5)
    
    # And it is essentially "Background" behind the protected logo.
    # So: Remove (Neutral) AND (NOT Protected).
    
    mask_to_remove = mask_neutral & (~mask_protected)
    
    # Apply Removal
    data[mask_to_remove, 3] = 0
    
    # 3. Smooth Edges
    img_processed = Image.fromarray(data)
    alpha = img_processed.split()[3]
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5))
    img_processed.putalpha(alpha)
    
    img_processed.save(output_path)
    print(f"Saved logo-ai-final.png to {output_path}")

clean_logo_v12(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-ai-clean.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-ai-final.png"
)
