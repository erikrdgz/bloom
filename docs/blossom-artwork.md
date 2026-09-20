# Blossom artwork

The canopy is built from recolorable SVG blossoms in `src/components/BlossomTree.vue`, arranged along boughs by `src/lib/blossoms.ts`. Seven opaque shades are derived from the active primary color. Rear sprays sit behind the branch image, with foreground flowers layered over it.

Branch asset: `public/images/cherry-wood-clean.png`.

Created with the built-in image generation tool, using `public/images/cherry-wood-hd.png` as the edit target. Original asset retained.

## Final prompt

Use case: background-extraction. Edit target: the supplied bare cherry tree cutout. Preserve the exact trunk position, silhouette, branch arrangement and 3:2 framing. Remove ALL cloudy brown background haze, ghostly outlines and blur between and around the branches. Produce a genuinely transparent PNG with clean alpha around every branch. Refine the smallest twigs into crisp natural woody shapes with clear edges; keep bark texture photorealistic and the existing major branches intact. Branches should be opaque wood, empty spaces completely transparent, no fog, no glow, no shadows outside wood, no background color or checkerboard. No leaves or flowers: foliage is a separate dynamic layer in the app. High-definition sharp cutout, clean against both dark and light backgrounds.
