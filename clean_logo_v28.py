from PIL import Image, ImageChops
import numpy as np

def clean_logo_v28(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # 1. DETECT BACKGROUND COLORS
    # Sample top row and left column
    # The checkerboard pattern usually repeats.
    # Collect unique colors from the border.
    
    # Border pixels
    top_row = data[0, :, :3]
    left_col = data[:, 0, :3]
    
    # Get unique colors
    unique_colors = np.unique(np.vstack((top_row, left_col)), axis=0)
    
    print(f"Found {len(unique_colors)} border colors.")
    
    # Standard checkerboard usually has 2 main colors.
    # But due to compression, there might be noise.
    # We treat all "Border Colors" as background.
    
    background_mask = np.zeros(data.shape[:2], dtype=bool)
    
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    
    tolerance = 15 # Tolerance for compression noise
    
    for color in unique_colors:
        # Check if color is 'Greyish' (Neutral)
        # We don't want to accidentally pick up the Knife tip if it touches border?
        # Knife is bright silver. Checkerboard is usually mid-grey.
        # Check brightness.
        # brightness = np.mean(color)
        
        # Safe check: Only treat as BG if it's relatively neutral
        if np.max(color) - np.min(color) < 20: # It is GREY
            print(f"Removing BG Color: {color}")
            
            diff = np.abs(r - color[0]) + np.abs(g - color[1]) + np.abs(b - color[2])
            background_mask |= (diff < tolerance)
            
    # 2. APPLY MASK
    data[background_mask, 3] = 0
    
    # 3. CLEAN UP HOLES (A, B, Ç, etc.)
    # The global color removal should handle this automatically if the holes show the checkerboard.
    # BUT, if there are noise pixels inside the holes, they might remain.
    # Since this is a high-res image, global removal is usually sufficient.
    
    # 4. SOLIDIFY?
    # User said "don't create fade lines".
    # The original image might have anti-aliasing (semi-transparent edges).
    # If we keep them, it looks smooth.
    # If we force solid, it looks aliased.
    # We keep ORIGINAL alpha for edges unless they are very faint.
    
    # However, user complained about "silik" (faint).
    # If the original text is "Dark Navy on Transparency", it should be fine.
    # But if it was "Dark Navy on Grey", removing Grey might leave "Semi-Transparent Navy".
    # Result: The edge pixels become lower opacity.
    
    # To fix "Silik" look without destroying shape:
    # Boost Alpha of non-fully-transparent pixels?
    # Let's try to maintain original first. If user says faint, we boost.
    
    # 5. AUTO CROP
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

# Use the SECOND uploaded image
input_file = r"C:/Users/large/.gemini/antigravity/brain/c599f0d1-ffa9-420f-b5ff-6f997452a336/uploaded_media_1_1769863184719.png"
output_file = r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-hq-final-v28.png"

clean_logo_v28(input_file, output_file)
