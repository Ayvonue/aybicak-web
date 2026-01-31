from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v6(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # 1. Flood Fill Outer Background (Safe)
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=50) # Top-Left
    ImageDraw.floodfill(img, (width-1, 0), (0, 0, 0, 0), thresh=50) # Top-Right
    ImageDraw.floodfill(img, (0, height-1), (0, 0, 0, 0), thresh=50) # Bottom-Left
    ImageDraw.floodfill(img, (width-1, height-1), (0, 0, 0, 0), thresh=50) # Bottom-Right
    
    # 2. Convert to Numpy for Precision Inner Cleaning
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Target: Checkerboard Grey/White INSIDE protected areas.
    # Checkerboard Grey is visibly distinct from the smooth metallic gradient of the knife.
    # It is usually a flat color block.
    # Range: 200-215 (Grey) AND 250-255 (White).
    # To be safe, we only remove if it's "Neutral" (R~=G~=B).
    
    mask_neutral = (np.abs(r - g) < 5) & (np.abs(g - b) < 5) & (np.abs(r - b) < 5)
    
    # White Inner Holes (Safe to remove usually)
    mask_white = (r > 240) & (g > 240) & (b > 240) & mask_neutral & (a > 0)
    data[mask_white, 3] = 0
    
    # Grey Inner Holes
    # We must be careful not to delete silver.
    # Silver is also neutral grey.
    # Difference: Checkerboard is exactly flat. Silver is gradient.
    # But pixel-by-pixel this is hard.
    # Let's try a very narrow band for the grey squares: 204 +/- 2.
    
    mask_grey_exact = (r >= 200) & (r <= 208) & \
                      (g >= 200) & (g <= 208) & \
                      (b >= 200) & (b <= 208) & \
                      mask_neutral & (a > 0)
                      
    # Applying this might eat some silver pixels but likely scattered ones, not the whole shape.
    # The checkerboard is a large pattern.
    data[mask_grey_exact, 3] = 0

    # 3. Soften Edges (Anti-aliasing)
    # The flood fill leaves jagged edges.
    img_processed = Image.fromarray(data)
    
    # Get alpha
    alpha = img_processed.split()[3]
    # Smarter smoothing: Blur only the alpha channel
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    # Thresholding back to keep edges sharp but smooth? No, keep it soft.
    
    img_processed.putalpha(alpha)
    
    img_processed.save(output_path)
    print(f"Saved logo-v6.png to {output_path}")

clean_logo_v6(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-new-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-v6.png"
)
