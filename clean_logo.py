
from PIL import Image
import numpy as np

def remove_black_background(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        data = np.array(img)

        # Define what is "black" (with some tolerance)
        r, g, b, a = data.T
        black_areas = (r < 30) & (g < 30) & (b < 30)

        # Turn black pixels transparent
        data[..., 3][black_areas.T] = 0

        # Save result
        new_img = Image.fromarray(data)
        new_img.save(output_path)
        print(f"Successfully converted {input_path} to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_img = "public/logo-screen.png" # Reverting to original font version
    output_img = "public/logo-final.png"
    remove_black_background(process_img, output_img)
