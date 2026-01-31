from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def make_logo_red(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # 1. Create a Red Background Image
    bg_red = Image.new("RGBA", img.size, (255, 0, 0, 255))
    
    # 2. Logic to Separate Logo from Background
    # The input has a checkerboard background (White and Light Grey).
    
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Identify Background Colors
    # Top-Left is usually background.
    tl_color = data[0,0]
    # It's a checkerboard, so we have 2 main BG colors.
    # 1. White (255, 255, 255) approx
    # 2. Light Grey (Usually 204 or 240)
    
    # Let's find "Grey" or "White" areas that are NOT the logo.
    
    # Define Logo Protection (Same as V9 - very successful)
    # Navy Blue / Silver protection
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Protect if:
    # 1. Saturation is high (Navy Blue, Gold)
    # 2. Very Bright Silver (Brightness > 85? No, White BG is 255)
    #    This is the hard part: Distinguishing White BG from Bright Silver Highlight.
    #    Difference: Silver highlight is usually surrounded by darker grey. BG is a large block.
    #    Flood Fill is best for the outer part.
    
    # Strategy:
    # A. Flood Fill from corners to identify "Outer Background". Make a mask of it.
    # B. For Inner Background (Holes in text): Detect exact Checkerboard colors.
    
    # A. FLOOD FILL MASK
    # We will flood fill on a copy image with "Green".
    temp_img = img.copy()
    ImageDraw.floodfill(temp_img, (0,0), (0, 255, 0, 255), thresh=40)
    ImageDraw.floodfill(temp_img, (img.width-1, 0), (0, 255, 0, 255), thresh=40)
    ImageDraw.floodfill(temp_img, (0, img.height-1), (0, 255, 0, 255), thresh=40)
    ImageDraw.floodfill(temp_img, (img.width-1, img.height-1), (0, 255, 0, 255), thresh=40)
    
    temp_data = np.array(temp_img)
    # Wherever temp_data is Green (0,255,0), that is DEFINITELY background.
    mask_outer_bg = (temp_data[:,:,0] == 0) & (temp_data[:,:,1] == 255) & (temp_data[:,:,2] == 0)
    
    # B. INNER BACKGROUND (The checkerboard squares inside the letters)
    # These were NOT reached by flood fill.
    # We need to find pixels that match the checkerboard pattern colors EXACTLY.
    # Checkerboard colors are usually neutral (R=G=B).
    
    # Filter for Neutral Colors
    mask_neutral = (np.abs(r - g) < 5) & (np.abs(g - b) < 5) & (np.abs(r - b) < 5)
    
    # Filter for Specific Checkerboard Values
    # They are likely > 200 brightness.
    mask_light = (r > 200)
    
    # Candidates for Inner BG
    mask_inner_candidates = mask_neutral & mask_light
    
    # BUT, Silver is also Neutral and Light.
    # HOW TO PROTECT SILVER?
    # Silver usually has a gradient. Checkerboard is flat blocks.
    # Also, Inner BG is usually surrounded by Navy (Text).
    
    # Let's combine:
    # Real Background = (Outer BG Flood Filled) OR (Inner Candidates that are NOT Protected)
    # But wait, Silver IS protected.
    
    # Use strict protection mask again
    # High Saturation -> Keep (Navy)
    # Very Dark -> Keep (Navy shadows)
    # Gradient/Edge detection? Too complex.
    
    # Let's use the explicit "Safe" colors found in Step A.
    # Colors found in the Outer BG are "Approved BG Colors".
    # Collect unique colors from the Outer BG area?
    # Or just assume the user wants the "Red" to replace transparent areas.
    
    # Let's construct the final image.
    final_data = data.copy()
    
    # 1. Set Outer BG to RED
    final_data[mask_outer_bg, 0] = 255
    final_data[mask_outer_bg, 1] = 0
    final_data[mask_outer_bg, 2] = 0
    final_data[mask_outer_bg, 3] = 255 # Full opacity
    
    # 2. Set Inner Checkerboard to RED
    # Assuming Inner Checkerboard matches standard pattern
    # Use a stricter mask here to avoid eating silver highlights.
    # Silver highlights are rarely perfectly R=G=B=255 or R=G=B=204.
    
    # Let's try to remove White (255,255,255) and Light Grey (204,204,204) specifically if they are neutral.
    mask_pure_white = (r > 250) & (g > 250) & (b > 250) & mask_neutral
    mask_pure_grey = (r > 200) & (r < 210) & mask_neutral
    
    mask_inner_remove = (mask_pure_white | mask_pure_grey) & (~mask_outer_bg)
    
    final_data[mask_inner_remove, 0] = 255
    final_data[mask_inner_remove, 1] = 0
    final_data[mask_inner_remove, 2] = 0
    final_data[mask_inner_remove, 3] = 255
    
    res = Image.fromarray(final_data)
    res.save(output_path)
    print(f"Saved {output_path}")

make_logo_red(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-checkerboard-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\test-red-logo.png"
)
