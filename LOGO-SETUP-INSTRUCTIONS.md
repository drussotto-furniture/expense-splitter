# Logo Setup Instructions

## Save Your Logo Image

You provided a wallet/pie chart logo design. To use it in the app, please save it to the public directory:

### Steps:

1. **Save the logo file** you provided as: `/Users/drussotto/code-projects/expense-splitter/public/carvalytics-logo.png`

2. **Create an icon version** (just the wallet/pie chart without text) and save as: `/Users/drussotto/code-projects/expense-splitter/public/carvalytics-icon.png`

### Recommended Sizes:

- **Full logo** (carvalytics-logo.png):
  - Width: ~800px
  - Height: ~200px
  - Transparent background (PNG)

- **Icon only** (carvalytics-icon.png):
  - Size: 512x512px (square)
  - Just the wallet/pie chart graphic
  - Transparent background (PNG)

### After Saving:

Once you've saved both files, the logo will automatically appear throughout the app at:
- Login/Signup pages
- Navigation header
- Logo preview page
- Mobile app icon

---

## Logo Design Description

The logo features:
- **Blue wallet** icon with a white clasp
- **Pie chart** inside showing expense splits (gray/dark segments)
- **Two dollar coins** floating above
- **Blue accent lines** suggesting money movement
- **"Carvalytics" text** with "lytics" in blue
- **"EXPENSE SPLITTER" subtext** in gray

This design perfectly represents:
- Financial management (wallet + coins)
- Expense splitting (pie chart segments)
- Shared/collaborative aspect (open wallet with coins)

---

## Quick Terminal Commands

```bash
# After you save the files, rebuild and test:
cd /Users/drussotto/code-projects/expense-splitter
npm run build
npm run dev

# Then visit: http://localhost:3000/logo-preview
```

---

## Alternative: If You Have the Source File

If you have the original logo file (AI, SVG, or high-res PNG), you can:

1. Export as PNG with transparent background
2. Save both versions (full logo + icon only)
3. Run the commands above
4. Commit and push to deploy
