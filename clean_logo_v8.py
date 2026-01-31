from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v8(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # --- 1. Identify Background Color (Top-Left) ---
    bg_pixel = data[0, 0]
    bg_r, bg_g, bg_b = bg_pixel[0], bg_pixel[1], bg_pixel[2]
    print(f"Top-Left Background: ({bg_r}, {bg_g}, {bg_b})")
    
    # Define Background Tolerance
    # The background looks uniform/flat grey.
    # Let's say +/- 20 tolerance.
    
    mask_bg_color = (np.abs(r - bg_r) < 20) & \
                    (np.abs(g - bg_g) < 20) & \
                    (np.abs(b - bg_b) < 20)
    
    # --- 2. PROTECTION MASK (Dark Blue / Navy) ---
    # We must NOT delete Dark Blue pixels even if they are close to Grey locally.
    # Navy Blue has B > R and B > G (usually).
    # Background Grey has R ~= G ~= B.
    
    # Navy/Dark Blue Criteria:
    # Blue component is stronger than Red/Green.
    # Or simply: It's "Colored" (Saturation), not "Grey".
    
    # Saturation: Max(RGB) - Min(RGB).
    # Grey has low saturation. Navy has higher.
    saturation = np.max(data[:,:,:3], axis=2) - np.min(data[:,:,:3], axis=2)
    
    # If Saturation > 15 (arbitrary), it's likely part of the logo (Navy or Silver tint), not the flat Grey BG.
    mask_is_colorful = (saturation > 10)
    
    # Also, Logo Text is very Dark. Background is medium grey (~50).
    # If pixel is very dark (< 30), protect it.
    brightness = np.mean(data[:,:,:3], axis=2)
    mask_is_very_dark = (brightness < 35)
    
    mask_protected = mask_is_colorful | mask_is_very_dark
    
    # --- 3. Final Mask Calculation ---
    # Remove ONLY if (Is Background Color) AND (NOT Protected)
    mask_to_remove = mask_bg_color & (~mask_protected)
    
    # Apply removal
    data[mask_to_remove, 3] = 0
    
    # --- 4. FLOOD FILL for Safety ---
    # To remove isolated islands of background that might not have been caught
    # or to clean up edges.
    # Convert to image to ease flood fill if needed, but numpy mask is usually cleaner for color-keying.
    
    # Let's just use the Color Keying + Protection since the user said colors are distinguishable.
    
    # --- 5. Edge Smoothing ---
    img_processed = Image.fromarray(data)
    alpha = img_processed.split()[3]
    alpha = alpha.filter(ImageFilter.GoogleBlur(0.5) if hasattr(ImageFilter, 'GoogleBlur') else ImageFilter.GaussianBlur(0.5))
    img_processed.putalpha(alpha)
    
    img_processed.save(output_path)
    print(f"Saved logo-v8.png to {output_path}")

clean_logo_v8(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-v8.png"
)
