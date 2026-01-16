# Product 360° Images Directory

## Purpose
This directory contains 360° rotation images for each product in the Fun Prints catalog.

## Structure
Each product has its own folder with a `360` subdirectory containing 36 frames:

```
products/
├── round-neck-white/360/    (36 frames: frame_0.jpg to frame_35.jpg)
├── round-neck-black/360/    (36 frames: frame_0.jpg to frame_35.jpg)
├── round-neck-grey/360/     (36 frames: frame_0.jpg to frame_35.jpg)
├── round-neck-navy/360/     (36 frames: frame_0.jpg to frame_35.jpg)
├── polo-white/360/          (36 frames: frame_0.jpg to frame_35.jpg)
└── polo-black/360/          (36 frames: frame_0.jpg to frame_35.jpg)
```

## Image Requirements
- **Format**: JPG (recommended) or PNG
- **Resolution**: 2000×2000 pixels (1:1 aspect ratio)
- **File Size**: 200-300KB per frame (compressed)
- **Background**: Pure white (#FFFFFF)
- **Naming**: `frame_0.jpg` through `frame_35.jpg`

## Rotation Angles
- frame_0: 0° (Front view)
- frame_9: 90° (Right side)
- frame_18: 180° (Back view)
- frame_27: 270° (Left side)
- frame_35: 350° (Almost front)

## How It Works
The `Image360Viewer` component automatically loads these images based on the product ID:
- Product ID `round-neck-white` → loads from `/products/round-neck-white/360/`
- Drag interaction cycles through frames 0-35
- If images don't exist, shows fallback placeholder

## Adding New Products
1. Create folder: `public/products/{product-id}/360/`
2. Add 36 frames: `frame_0.jpg` to `frame_35.jpg`
3. Update `lib/products-data.ts` with matching product ID
4. Images will automatically load on product detail page

## Status
✅ Folder structure created
⏳ Waiting for 360° images to be generated

See `360_IMAGES_FOLDER_STRUCTURE.md` in project root for detailed instructions.
