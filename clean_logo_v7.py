from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v7(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Analyze Corner Color to Identify Background EXACTLY
    # Top-Left corner pixel usually gives the background color
    bg_color = data[0, 0]
    bg_r, bg_g, bg_b = bg_color[0], bg_color[1], bg_color[2]
    
    print(f"Detected Background Color: R={bg_r}, G={bg_g}, B={bg_b}")
    
    # Define tolerance for this dark grey
    # It seems to be around 40-45 RGB.
    # Silver logo is much brighter (starts around 150+).
    # Dark text (AYBIÇAK) is... wait, is the text darker or brighter than BG?
    # In the screenshot, "AYBIÇAK" is a very dark Navy Blue, maybe darker or similar to this new background?
    # Actually, looking at previous uploads, text was navy blue/black.
    # If background is #2A2A2A (42), and Text is Black (0), we are safe.
    # If Text is Navy #000030 (0,0,48) -> Safe.
    
    # Let's use a tolerance of 20-30.
    
    mask_bg = (np.abs(r - bg_r) < 30) & \
              (np.abs(g - bg_g) < 30) & \
              (np.abs(b - bg_b) < 30)
              
    # 2. Refine with Flood Fill?
    # Since the background is solid and contrasting, Color Removal is safer than Flood Fill IF the logo doesn't contain that color.
    # Does the logo contain dark grey (42,42,42)?
    # The knife handle is black. The circular background behind knife is Dark Navy.
    # If they are close to 42,42,42 might be an issue.
    # Let's use Flood Fill Strategy again, but simpler now that BG is uniform.
    
    # Create mask image from the color detection
    # We want to remove the 'Outer' Background.
    
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=25) 
    ImageDraw.floodfill(img, (width-1, 0), (0, 0, 0, 0), thresh=25)
    ImageDraw.floodfill(img, (0, height-1), (0, 0, 0, 0), thresh=25)
    ImageDraw.floodfill(img, (width-1, height-1), (0, 0, 0, 0), thresh=25)
    
    # Check inner holes
    # The letters A, B, A, K have holes.
    # Since the background is this specific Dark Grey, and it's unlikely to be in the "Silver" parts...
    # We can try to remove remaining exact BG colored pixels.
    # BUT, the text is also dark.
    # Let's rely on the user's image. If the text contrasts with the BG, we are good.
    
    # Converting back to numpy to handle remaining BG noise if any?
    # The flood fill usually handles connectivity well.
    # If there are disconnected BG islands (inside letters), we can remove them by color.
    
    data = np.array(img)
    r2, g2, b2, a2 = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Strict removal for inner parts
    # Only remove if EXACTLY background color (within small tolerance)
    # AND alpha is still > 0 (hasn't been flood filled)
    mask_residual_bg = (np.abs(r2 - bg_r) < 15) & \
                       (np.abs(g2 - bg_g) < 15) & \
                       (np.abs(b2 - bg_b) < 15) & \
                       (a2 > 0)
    
    # Is it safe? Dark Navy circle of logo might be close.
    # Let's assume Flood Fill did the heavy lifting.
    # Only applying residual removal if we are sure.
    # Let's skip residual removal to protect the logo interior. The User cares about the Logo integrity most.
    # If inner holes of 'A' remain dark grey, it's better than losing the knife handle.
    
    # 3. Soften Edges
    # The transition from Dark BG to Silver might be cleaner now.
    img_processed = Image.fromarray(data)
    alpha = img_processed.split()[3]
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    img_processed.putalpha(alpha)
    
    img_processed.save(output_path)
    print(f"Saved logo-v7.png to {output_path}")

clean_logo_v7(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-v7.png"
)
