from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np

def clean_logo_v10(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # --- STEP 1: SMART CROP (Remove Outer Margins) ---
    # Convert to Numpy to analyze content
    data = np.array(img)
    bg_pixel = data[0, 0]
    bg_r, bg_g, bg_b = bg_pixel[0], bg_pixel[1], bg_pixel[2]
    
    # Calculate difference from background color
    # Any pixel significantly different from BG is "Content"
    diff = np.abs(data[:,:,0] - bg_r) + np.abs(data[:,:,1] - bg_g) + np.abs(data[:,:,2] - bg_b)
    
    # Threshold for "Content". Noise is small difference. Content (Navy/Silver) is big.
    # Diff threshold > 30 summing 3 channels is safe.
    mask_content = (diff > 40)
    
    # Find bounding box of content
    rows = np.any(mask_content, axis=1)
    cols = np.any(mask_content, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print("Error: Could not find any content differing from background!")
        return

    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    
    # Add a tiny padding (2px) to not cut off anti-aliased edges
    padding = 2
    ymin = max(0, ymin - padding)
    ymax = min(data.shape[0], ymax + padding)
    xmin = max(0, xmin - padding)
    xmax = min(data.shape[1], xmax + padding)
    
    print(f"Cropping from ({xmin},{ymin}) to ({xmax},{ymax})")
    
    # Perform Crop
    img_cropped = img.crop((xmin, ymin, xmax, ymax))
    
    # --- STEP 2: CLEANING (On Cropped Image) ---
    # Now we only need to clean the small gaps INSIDE the bounding box.
    data_cropped = np.array(img_cropped)
    
    # Re-sample background color from the crop (it might be slightly different or same)
    # Actually, stick to the original reference or measure top-left of crop if it's empty space.
    # But Crop might be tight on the logo.
    # Let's use the original measured BG color.
    
    r, g, b, a = data_cropped[:, :, 0], data_cropped[:, :, 1], data_cropped[:, :, 2], data_cropped[:, :, 3]
    
    # Aggressive Tolerance (Same as V9)
    tol = 55
    
    mask_to_remove = (np.abs(r - bg_r) < tol) & \
                     (np.abs(g - bg_g) < tol) & \
                     (np.abs(b - bg_b) < tol)
    
    # Protection (Same as V9)
    # Saturation or Brightness logic
    saturation = np.max(data_cropped[:,:,:3], axis=2) - np.min(data_cropped[:,:,:3], axis=2)
    brightness = np.mean(data_cropped[:,:,:3], axis=2)
    
    mask_protected = (saturation > 12) | (brightness > 85) | (brightness < 15)
    
    # Final Mask
    mask_final = mask_to_remove & (~mask_protected)
    
    data_cropped[mask_final, 3] = 0
    
    # --- STEP 3: EDGE SOFTENING ---
    ret = Image.fromarray(data_cropped)
    alpha = ret.split()[3]
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.5))
    ret.putalpha(alpha)
    
    ret.save(output_path)
    print(f"Saved logo-v10.png to {output_path}")

clean_logo_v10(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-contrast-v8-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-v10.png"
)
