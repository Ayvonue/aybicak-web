from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v24(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    height, width, _ = data.shape
    
    # --- STEP 1: DEFINE ZONES ---
    # The Logo (Icon) is on the Left. The Text is on the Right.
    # We can split by X coordinate.
    # Let's find where the Icon ends.
    # Icon is Bright Silver. Text is Dark Navy.
    
    brightness = np.mean(data[:,:,:3], axis=2)
    
    # Find columns that have "Bright" pixels (Icon)
    cols_bright = np.any(brightness > 150, axis=0)
    # The icon is likely the first block of bright pixels.
    # Let's estimate split point around 35-40% width.
    split_x = int(width * 0.38)
    
    print(f"Splitting zones at X={split_x}")
    
    # --- STEP 2: COMMON BACKGROUND REMOVAL ---
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    # Background: Neutral and Dark-ish
    mask_bg = (neutrality < 15) & (brightness < 90) & (brightness > 30)
    data[mask_bg, 3] = 0
    
    # --- STEP 3: PROCESS ZONES ---
    
    # ZONE A: ICON (Left of split_x)
    # ACTION: DO NOTHING EXTRA. Just keep the nice background removal we just did.
    # Ensure we didn't accidentally delete parts of the black handle?
    # Black handle is <30 brightness? Our BG mask was >30. So handle should be safe.
    
    # ZONE B: TEXT (Right of split_x)
    # ACTION: REPAIR & SOLIDIFY
    
    # Extract Text Zone data
    text_zone = data[:, split_x:]
    
    # Detect Text Pixels in this zone
    # Condition: Alpha > 0 (Meaning not background)
    mask_text_pixels = text_zone[:,:,3] > 0
    
    # Convert to PIL Image for Morphology
    mask_img = Image.fromarray((mask_text_pixels.astype(np.uint8) * 255))
    
    # DILATE (Thicken to fill holes)
    # Size 5 (Radius 2) was good for filling, let's stick to it but applied ONLY to text.
    mask_dilated = mask_img.filter(ImageFilter.MaxFilter(5))
    
    # ERODE (Restore shape)
    mask_restored = mask_dilated.filter(ImageFilter.MinFilter(3)) # Net +1 pixel thickening
    
    mask_final_text_bool = np.array(mask_restored) > 128
    
    # Apply Solid Color to the processed mask
    navy_r, navy_g, navy_b = 14, 29, 43
    
    # We need to write this back into the main 'data' array at the correct offset
    
    # Create a canvas for the text zone
    # We only update pixels that are in the Final Mask
    
    # Get coordinates in the sub-array
    y_coords, x_coords = np.where(mask_final_text_bool)
    
    # Shift x_coords by split_x to map back to main image
    # data[y, x + split_x] = color
    
    count = 0
    if len(y_coords) > 0:
        # Vectorized update is tricky with offset, let's loop or slice
        # Easier: Update the 'text_zone' slice then assign back?
        # Careful with references.
        
        # Let's operate on the slice 'text_zone'.
        text_zone[mask_final_text_bool, 0] = navy_r
        text_zone[mask_final_text_bool, 1] = navy_g
        text_zone[mask_final_text_bool, 2] = navy_b
        text_zone[mask_final_text_bool, 3] = 255 # Solid
        
        # Assign back the modified slice to the main data
        data[:, split_x:] = text_zone
        print("Text zone reconstructed.")
        
    # --- STEP 4: CLEAN UP SPLIT LINE? ---
    # No need, transparency handles it.
    
    # --- STEP 5: AUTO-CROP ---
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

clean_logo_v24(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-professional-v24.png"
)
