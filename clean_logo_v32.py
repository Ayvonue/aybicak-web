from PIL import Image, ImageEnhance
import numpy as np
from collections import deque

def clean_logo_v32(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    height, width = data.shape[:2]
    
    # 1. SMART BACKGROUND SAMPLING
    # Sample pixels from the absolute edges (Border 2px)
    # This guarantees we catch both "Light" and "Dark" tiles of the checkerboard.
    
    border_pixels = []
    # Top and Bottom
    for x in range(width):
        border_pixels.append(tuple(data[0, x, :3]))
        border_pixels.append(tuple(data[1, x, :3]))
        border_pixels.append(tuple(data[height-1, x, :3]))
        border_pixels.append(tuple(data[height-2, x, :3]))
        
    # Left and Right
    for y in range(height):
        border_pixels.append(tuple(data[y, 0, :3]))
        border_pixels.append(tuple(data[y, 1, :3]))
        border_pixels.append(tuple(data[y, width-1, :3]))
        border_pixels.append(tuple(data[y, width-2, :3]))
        
    unique_border = set(border_pixels)
    print(f"Found {len(unique_border)} unique border colors.")
    
    # 2. CREATE 'TRAVERSABLE' MASK
    # A pixel is "Traversable" (Background) if it is close to ANY border color.
    # This handles compression noise.
    
    # Optimization: Convert unique_border to array for broadcasting?
    # Too slow for O(N*M).
    # Heuristic: The border colors are GREY [C, C, C].
    # Just check if R~=G~=B and within range of min/max border brightness.
    
    border_arr = np.array(list(unique_border))
    min_bright = np.min(np.mean(border_arr, axis=1)) - 10
    max_bright = np.max(np.mean(border_arr, axis=1)) + 10
    
    print(f"Background Brightness Range: {min_bright} - {max_bright}")
    
    r, g, b = data[:,:,0].astype(int), data[:,:,1].astype(int), data[:,:,2].astype(int)
    brightness = (r + g + b) / 3
    
    # Metric for Greyness: Max diff between channels should be low
    saturation = np.maximum(np.abs(r-g), np.maximum(np.abs(g-b), np.abs(b-r)))
    
    # Traversable = (In Brightness Range) AND (Is Grey / Low Saturation)
    # Checkerboard is usually perfectly grey.
    # Allow small saturation for noise (e.g. < 15)
    
    mask_traversable = (brightness >= min_bright) & (brightness <= max_bright) & (saturation < 20)
    
    # 3. FLOOD FILL
    filled_mask = np.zeros((height, width), dtype=bool)
    starts = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    queue = deque()
    
    # Initialize queue
    for x, y in starts:
        if 0 <= x < width and 0 <= y < height:
             if mask_traversable[y, x]:
                 queue.append((x, y))
                 filled_mask[y, x] = True
    
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    
    processed_count = 0
    while queue:
        cx, cy = queue.popleft()
        processed_count += 1
        
        for dx, dy in dirs:
            nx, ny = cx + dx, cy + dy
            
            if 0 <= nx < width and 0 <= ny < height:
                if not filled_mask[ny, nx]:
                    if mask_traversable[ny, nx]:
                        filled_mask[ny, nx] = True
                        queue.append((nx, ny))
                        
    print(f"Flood filled {processed_count} pixels.")
    
    # 4. APPLY TRANSPARENCY
    data[filled_mask, 3] = 0
    
    # 5. VISIBILITY BOOST (Brightness)
    img_clean = Image.fromarray(data)
    enhancer = ImageEnhance.Brightness(img_clean)
    img_bright = enhancer.enhance(1.3) # 1.3x Brightness
    
    # 6. AUTO CROP
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
output_file = r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-final-v32.png"

clean_logo_v32(input_file, output_file)
