from PIL import Image, ImageDraw
import numpy as np

def clean_logo_smart_fill(input_path, output_path):
    print(f"Processing {input_path}...")
    # Open image
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # --- STRATEGY: FLOOD FILL FROM CORNERS ---
    # This acts like the "Magic Wand" tool with "Contiguous" checked.
    # It deletes the background connected to the outside, but stops when it hits the logo.
    # This guarantees we don't accidentally delete pixels INSIDE the logo (like the silver knife).
    
    # 1. Define the "Background Color" to remove.
    # Since it's a checkerboard, we have White (255) and Grey (204).
    # FloodFill needs a threshold.
    
    # Let's use ImageDraw.floodfill.
    # We will do it multiple times for tolerance.
    
    # We want to make the background TRANSPARENT (0, 0, 0, 0).
    
    # Threshold: How different a pixel can be to be included.
    # Checkerboard contrasts well with the Dark Circle of the logo.
    # But be careful with "AYBIÇAK" text which is connected to background?
    # No, text is floating. Flood fill will go around it.
    
    # Is the text connected? If the letters are loose, flood fill works perfectly around them.
    # If the text is separate, flood fill will eat the background between letters too.
    # BUT, the "Holes" inside letters (A, B, etc.) might remain filled if completely closed.
    # That's acceptable for now to save the Knife. We can clean holes later if needed.
    
    # Execute Flood Fill from all 4 corners to be safe
    # thresh=50 covers the difference between White(255) and Grey(204) -> diff is 51.
    # So we need thresh around 60 to grab both white and grey blocks as "one background".
    
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=80) 
    ImageDraw.floodfill(img, (width-1, 0), (0, 0, 0, 0), thresh=80)
    ImageDraw.floodfill(img, (0, height-1), (0, 0, 0, 0), thresh=80)
    ImageDraw.floodfill(img, (width-1, height-1), (0, 0, 0, 0), thresh=80)
    
    # Now, let's look for "Islands" (e.g. inside 'A', 'B') that weren't reached.
    # These are pixels that are still White/Grey but surrounded by logo colors.
    # We can try a secondary color-based pass for them, BUT with strict constraints.
    # Only remove if EXACTLY matching Checkerboard Grey (204, 204, 204).
    # The silver knife is usually a gradient, unlikely to be large flat 204 areas.
    
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Strict Checkerboard Grey Removal (for inner holes)
    # 204 is standard checkerboard grey. Let's target a narrow range.
    mask_grey_holes = (r > 200) & (r < 210) & \
                      (g > 200) & (g < 210) & \
                      (b > 200) & (b < 210) & \
                      (a > 0) # Only visible pixels
                      
    data[mask_grey_holes, 3] = 0
    
    # Strict White Removal (for inner holes)
    mask_white_holes = (r > 250) & (g > 250) & (b > 250) & (a > 0)
    data[mask_white_holes, 3] = 0
    
    # Save result
    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Saved smart-filled logo to {output_path}")

clean_logo_smart_fill(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-final-fix.png"
)
