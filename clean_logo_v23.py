from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v23(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Background Removal (V17 Logic)
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    brightness = np.mean(data[:,:,:3], axis=2)
    mask_bg = (neutrality < 15) & (brightness < 90) & (brightness > 30)
    data[mask_bg, 3] = 0
    
    # 2. NUCLEAR TEXT RECONSTRUCTION
    # Strategy:
    # Any pixel that is NOT background and NOT bright (Knife) is "Potentially Text".
    # Even if it's very faint or disconnected.
    
    # Detect "Dark Stuff" (that isn't the background we just removed)
    # Background pixels now have alpha=0.
    # So look at Alpha > 0.
    
    # Knife is Bright (>160).
    # Text is the rest.
    
    mask_potential_text = (data[:,:,3] > 0) & (brightness < 160)
    
    # Convert to image for operations
    mask_img = Image.fromarray((mask_potential_text.astype(np.uint8) * 255))
    
    # OP: CLOSE GAPS (Dilation followed by Erosion)
    # Last time size 5 was not enough? Let's go BIGGER but safer.
    # Iterative approach:
    # 1. Dilate distinctively to connect EVERYTHING.
    
    # Using Size 5 (Radius 2) again but maybe multiple passes?
    # Or just one heavy pass.
    # Let's try Size 7 (Radius 3). This bridges 6-pixel gaps.
    mask_connected = mask_img.filter(ImageFilter.MaxFilter(7))
    
    # 2. Erode back to restore shape.
    # If we dilated 3px, erode 3px.
    mask_restored = mask_connected.filter(ImageFilter.MinFilter(7))
    
    # 3. FILL HOLES (Internal)
    # Any pixel inside the "Restored" blob should be SOLID.
    
    mask_final_text = np.array(mask_restored) > 128
    
    # 4. PAINT IT
    navy_r, navy_g, navy_b = 14, 29, 43
    
    # Apply to ALL pixels in the mask
    # This might make it look "cartoonish" or "blocky" but it will be SOLID.
    
    # Safety Check: Don't paint over the knife if mask expanded too much.
    # Knife is Bright > 160.
    mask_paint = mask_final_text & (brightness < 170)
    
    # ALSO: Recover any stray pixels that were original text but outside the mask?
    # (Unlikely if we dilated 7px).
    
    data[mask_paint, 0] = navy_r
    data[mask_paint, 1] = navy_g
    data[mask_paint, 2] = navy_b
    data[mask_paint, 3] = 255 # FULL OPACITY
    
    # 5. ANTI-ALIASING (Soften edges)
    # The reconstruction makes hard jagged edges.
    # We can smooth the Alpha channel slightly.
    
    # But user said "Solid". Hard edges are solid.
    # Let's leave it sharp for maximum "filled" look.
    
    # 6. Auto-Crop
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

clean_logo_v23(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-solid-v23.png"
)
