from PIL import Image, ImageFilter, ImageChops
import numpy as np

def clean_logo_ultimate(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # 1. Basic Background Removal (High Tolerance)
    # Convert to array for color detection
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 3-channel distance from Neutral Grey/White
    # Checkerboard is neutral (R~=G~=B).
    diff = np.max(np.abs(data[:,:,:3] - data[:,:,:3].mean(axis=2, keepdims=True)), axis=2)
    
    # Background is (Neutral) AND (Bright > 100)
    # or Just Very Bright (White)
    brightness = data[:,:,:3].mean(axis=2)
    
    mask_bg = ((diff < 15) & (brightness > 120)) | (brightness > 210)
    
    # Create Base Alpha Mask
    # Start with original alpha
    new_alpha = a.copy()
    # Set background pixels to 0
    new_alpha[mask_bg] = 0
    
    # Convert alpha to Image for filtering
    alpha_img = Image.fromarray(new_alpha, mode='L')
    
    # --- 2. EDGE EROSION (Shrink the selection) ---
    # This cuts off the 1px white border
    # Use MinFilter (Erosion)
    # Radius 1 might be too strong, let's try a custom kernel or iterate min filter
    # For now, MinFilter(3) is 1px erosion.
    alpha_eroded = alpha_img.filter(ImageFilter.MinFilter(3))
    
    # --- 3. SOFTEN EDGES (Anti-aliasing) ---
    # Blur the alpha slightly to make edges smooth, not jagged
    alpha_soft = alpha_eroded.filter(ImageFilter.GaussianBlur(0.5))
    
    # --- 4. COLOR DECONTAMINATION (Edge Darkening) ---
    # Crucial for Dark Backgrounds:
    # Any semi-transparent pixel that was "White" in the original
    # will look like a white halo on a dark navbar.
    # We must blend the edge colors towards the LOGO color (Dark Blue/Black).
    
    # New RGB data
    # If a pixel is transparent in our new alpha, we don't care.
    # But if it's on the edge, we want it darker.
    
    # Convert soft alpha back to numpy
    final_alpha = np.array(alpha_soft)
    
    # Update data
    data[:, :, 3] = final_alpha
    
    # For RGB:
    # Identify pixels that are visibly "White/Grey" but are kept in the logo (e.g. edge artifacts)
    # If Alpha is partial, Multiply RGB by Alpha/255 (Premultiply simulation for Darkbg)
    # This darkens the semi-transparent edges.
    
    # Float conversion for math
    norm_alpha = final_alpha.astype(float) / 255.0
    
    # Darken edges: multiply RGB by alpha^2 (more aggressive darkening at transparency)
    # This kills the white fringe.
    # Original: White (255) * 0.5 alpha -> 128 Grey (VISIBLE HALO)
    # Darkened: White (255) * 0.5 * 0.5 -> 64 Dark Grey (LESS VISIBLE)
    # Or just multiply.
    
    for i in range(3): # R, G, B
        channel = data[:, :, i].astype(float)
        # Apply darkening only to the very edges (where alpha < 255)
        # We can just multiply channel by alpha for a "Pre-multiplied black" effect
        channel = channel * norm_alpha
        data[:, :, i] = channel.astype(np.uint8)

    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Saved logo-user-ultimate.png to {output_path}")

clean_logo_ultimate(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-ultimate.png"
)
