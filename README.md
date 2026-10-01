# Prints & Pesos

A lightweight print-cost and pricing calculator for the Bambu Lab A1. It uses Philippine pesos (PHP) and works as a static website with no build step.

## How pricing works

- Base cost = print hours × **₱10/hour** + filament grams × **₱1.50/gram**
- Suggested price = base cost × the adjustable selling-price multiplier
- The available filament colors are Black, White, Grey, Pink, and Red. Color selection is for order notes and does not affect the price.

The multiplier is only a guide. Consider each print’s complexity, finishing time, demand, and what customers are willing to pay. You can adjust the hourly and filament rates in the calculator.

## Saved data

Quotes, selected colors, custom rates, and theme preference are stored in the current browser on the current device. They are not synced between devices.

## Run or deploy

Open `index.html` in a browser or serve this folder with a static web server. To deploy on Vercel, import the repository as a static site; no build command is needed.
