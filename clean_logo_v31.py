from PIL import Image, ImageEnhance, ImageDraw
import numpy as np

def clean_logo_v31(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # 1. FLOOD FILL BACKGROUND REMOVAL
    # Instead of "Color Matching" which leaves noise speckles (V30 disaster),
    # We use FLOOD FILL from the corners. This guarantees we only remove the actual background.
    
    # We need to use ImageDraw.floodfill or similar.
    # But PIL floodfill fills with a COLOR.
    # We want to fill with TRANSPARENCY.
    
    # Let's use a "mask" approach with flood fill.
    # Create a temp image for flood filling
    # Assume 0,0 is background.
    
    # First, let's identify "Background-ish" pixels by color tolerance (like V28)
    # But only use them if they are connected to the edge.
    
    # Border sampling
    bg_color = data[0,0][:3]
    print(f"BG Base Color: {bg_color}")
    
    # Tolerance mask
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    diff = np.abs(r - int(bg_color[0])) + np.abs(g - int(bg_color[1])) + np.abs(b - int(bg_color[2]))
    mask_bg_color = diff < 20 # Strict tolerance
    
    # Now, find Connected Components starting from (0,0)
    # Use simple recursion or skimage flood_fill?
    # Better: Use PIL ImageDraw.floodfill on a mask.
    
    mask_img = Image.new("L", img.size, 0)
    # Create a white canvas where "Potential BG" is BLACK
    # Wait, floodfill fills a color.
    
    # Let's do:
    # 1. Create an image where "Potential BG" pixels are WHITE, others BLACK.
    mask_pil = Image.fromarray((mask_bg_color.astype(np.uint8) * 255), mode="L")
    
    # 2. Flood fill from (0,0) with GRAY (128).
    # Then extract only the GRAY pixels. These are the "Connected Background".
    # Noise speckles inside the logo will remain WHITE (255) and won't be touched.
    
    # Manual Flood Fill using BFS
    from collections import deque
    
    width, height = mask_pil.size
    mask_pixels = mask_pil.load() # 0 = Other, 255 = Potential BG (From mask_bg_color)
    
    # We want to find "Connected BG" pixels.
    # Let's create a visited/result mask.
    filled_mask = np.zeros((height, width), dtype=bool)
    
    # Start points (Corners)
    starts = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    queue = deque()
    
    for x, y in starts:
        if 0 <= x < width and 0 <= y < height:
             # Only start if it matches "Potential BG" criteria (White in mask_pil)
             if mask_pixels[x, y] == 255:
                 queue.append((x, y))
                 filled_mask[y, x] = True

    # Directions (4-connectivity)
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    
    while queue:
        cx, cy = queue.popleft()
        
        for dx, dy in dirs:
            nx, ny = cx + dx, cy + dy
            
            if 0 <= nx < width and 0 <= ny < height:
                if not filled_mask[ny, nx]:
                    # Check if it is Potential BG
                    if mask_pixels[nx, ny] == 255:
                        filled_mask[ny, nx] = True
                        queue.append((nx, ny))
    
    mask_final_bg = filled_mask
    
    # Apply Transparency to Connected Background ONLY
    data[mask_final_bg, 3] = 0
    
    # 2. VISIBILITY FIX (Gamma Correction)
    # User hated the "Glow" (V30).
    # User hated the "Neon Brightness" (V29).
    # But text is physically dark.
    # We must lighten it GENTLY to be visible on dark grey.
    # Gamma correction lightens midtones (the navy) preserving details.
    
    # Update data array
    img_clean = Image.fromarray(data)
    
    # Enhance Brightness slightly (1.5x) NOT 3.0x
    enhancer = ImageEnhance.Brightness(img_clean)
    img_bright = enhancer.enhance(1.4) 
    
    # 3. AUTO CROP
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
output_file = r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-clean-v31.png"

clean_logo_v31(input_file, output_file)
