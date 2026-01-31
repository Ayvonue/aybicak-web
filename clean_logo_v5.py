from PIL import Image, ImageDraw
import numpy as np
import sys

# Increase recursion depth for deep floodfill if needed
sys.setrecursionlimit(100000)

def clean_logo_final(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # --- 1. SMART BACKGROUND REMOVAL (Flood Fill) ---
    # This removes the background starting from corners, better than color-range 
    # because it protects the inner details (like silver knife) even if they match background color.
    
    # Convert properly to process
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=50) # Top-Left
    ImageDraw.floodfill(img, (width-1, 0), (0, 0, 0, 0), thresh=50) # Top-Right
    ImageDraw.floodfill(img, (0, height-1), (0, 0, 0, 0), thresh=50) # Bottom-Left
    ImageDraw.floodfill(img, (width-1, height-1), (0, 0, 0, 0), thresh=50) # Bottom-Right
    
    data = np.array(img)
    
    # --- 2. SPATIAL TEXT WHITENING ---
    # Only whiten the text on the RIGHT side of the image.
    # Preserve the icon (on the LEFT side) exactly as is (dark handle, silver blade).
    
    # Define a split point. Typically logo icon is leftmost 30-40%.
    # We will only apply color changes to the right of this line.
    split_x = int(width * 0.38) 
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # Create mask for pixels to the right of split_x
    # We perform operations only where x > split_x
    
    # On the right side, find DARK pixels (the text)
    # Text is likely Black or very dark Grey.
    # Condition: Dark color AND not fully transparent
    mask_text_area = np.zeros_like(r, dtype=bool)
    mask_text_area[:, split_x:] = True
    
    mask_dark_pixels = (r < 100) & (g < 100) & (b < 100) & (a > 50)
    
    mask_to_whiten = mask_text_area & mask_dark_pixels
    
    # Apply White to text
    data[mask_to_whiten, 0] = 255 # R
    data[mask_to_whiten, 1] = 255 # G
    data[mask_to_whiten, 2] = 255 # B
    # data[mask_to_whiten, 3] = 255 # Alpha remains as is or set to 255

    # --- 3. CLEANUP REMAINING ARTIFACTS ---
    # Sometimes floodfill misses isolated 'islands' of checkerboard inside letters like O, A, B.
    # We can do a color-range pass ONLY for light-grey/white pixels to make them transparent,
    # assuming the logo doesn't contain those exact weak non-connected colors.
    
    # White/Light Grey Background Noise Removal
    # (Only remove if it's NOT the white text we just created!)
    # Luckily our white text is (255,255,255).
    # Checkerboard is usually around 204 or near-white but not pure white 255 usually.
    
    # Let's be careful. If we just cleaned the text, we are good.
    # Any remaining background noise (e.g. inside the 'A' hole)
    # We can just target the specific checkerboard grey.
    
    mask_noise = (r > 180) & (g > 180) & (b > 180) & (a > 0)
    # Exclude our new Pure White Text
    mask_not_pure_white = (r < 254) | (g < 254) | (b < 254)
    
    final_noise_removal = mask_noise & mask_not_pure_white
    
    data[final_noise_removal, 3] = 0

    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Saved spatially cleaned logo to {output_path}")

clean_logo_final(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-target.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-final-v5.png"
)
