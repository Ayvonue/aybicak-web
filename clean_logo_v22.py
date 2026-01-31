from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_v22(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # 1. Background Removal (V17 Logic)
    neutrality = np.abs(r - g) + np.abs(g - b) + np.abs(b - r)
    brightness = np.mean(data[:,:,:3], axis=2)
    mask_bg = (neutrality < 15) & (brightness < 90) & (brightness > 30)
    data[mask_bg, 3] = 0
    
    # 2. Text RECONSTRUCTION (Heavy Duty)
    
    # Sensitivity: Catch even very faint bluish pixels
    # Original Navy is Dark (~30 brightness).
    # Faint parts might be darker or lighter? Usually lighter (mixed with bg).
    # Let's target anything not-neutral and darkish.
    
    mask_trace = (b > r) & (b > g) & (brightness < 140) & (data[:,:,3] > 0)
    
    # Convert to image for filtering
    mask_img = Image.fromarray((mask_trace.astype(np.uint8) * 255))
    
    # AGGRESSIVE DILATION (Thicken significantly)
    # Size 5 = Radius 2. This bridges 2-pixel gaps.
    mask_thick = mask_img.filter(ImageFilter.MaxFilter(5))
    
    # Closing holes: Dilate MORE then Erode back?
    # Let's try another pass of Dilation to be sure.
    # mask_ultra_thick = mask_thick.filter(ImageFilter.MaxFilter(3))
    
    # Then Erode to restore shape (but keeping internal holes filled)
    # If we dilated by 2px (Size 5), let's erode by 1px (Size 3).
    mask_restored = mask_thick.filter(ImageFilter.MinFilter(3)) # Size 3 is 3x3 kernel (radius 1)
    
    mask_bool = np.array(mask_restored) > 128
    
    # 3. Apply Solid Color
    navy_r, navy_g, navy_b = 14, 29, 43
    
    # Protect Knife (Bright)
    mask_final = mask_bool & (brightness < 170)
    
    # Apply
    data[mask_final, 0] = navy_r
    data[mask_final, 1] = navy_g
    data[mask_final, 2] = navy_b
    data[mask_final, 3] = 255
    
    # 4. Auto-Crop
    img_new = Image.fromarray(data)
    bbox = img_new.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        img_new = img_new.crop(bbox)
        img_new.save(output_path)
        print(f"Saved {output_path}")
    else:
        print("Error: Empty image")

clean_logo_v22(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-text-reconstructed.png"
)
