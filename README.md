# VELOCITY VERSE — Automotive Journal

Premium Next.js automotive publication with an existing admin CMS, a database of demo articles, and an upgraded 10-photo upload and slideshow system.

## Requirements

- Node.js 22.16+ with `node:sqlite` support
- npm and internet access for dependency installation
- Persistent local or server storage for `data/`

## Install and run (Windows PowerShell)

1. Extract this ZIP to a folder, e.g. `Desktop\\velocity-verse`.
2. Open the folder in VS Code or PowerShell.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

5. Edit `.env.local` to set a long **AUTH_SECRET**, **ADMIN_EMAIL**, and a strong **ADMIN_PASSWORD** (at least 12 characters).
6. Create/reset your administrative login with `npm run admin:reset`. The supplied database contains sample records; this replaces the original demo admin password.
7. Start the website with `npm run dev`.
8. Open <http://localhost:3000> for the public website, and <http://localhost:3000/admin/login> for Velocity Verse Studio.

**Production:** Run `npm run build` then `npm start` on a persistent server with an AUTH_SECRET configured. Always use HTTPS.

## Publishing a 10-photo supercar story

1. Open **Velocity Verse Studio → New Story Composer**, or **Fast Dispatch** for a short post.
2. Choose **Supercars**, **Reviews** or **Compare** (or another available category).
3. Enter headline, excerpt, and article text.
4. Under **Story photo gallery**, select up to **10 JPG, PNG, WebP or AVIF images** from your device. Maximum **10 MB per file**.
5. The first uploaded image is your **cover**. Reorder photos with the arrow buttons or **Set cover**; edit the photo descriptions.
6. Choose **Publish Article**. Each photo is saved on the server, and its ordered gallery is saved in the SQLite database.
7. Open the published article to see the image slideshow: **next/previous arrows**, clickable thumbnails, touch swipes, a slide counter, and fullscreen photo view. Older stories without a gallery still show a normal hero image.

If you publish two Facebook posts each day, you can reuse their 10 original photos in two separate Velocity Verse website articles. Posting to Facebook is **not** automated.

## Changes in this version

- Replaced stock letter-based mark with the custom provided Velocity Verse speedometer emblem.
- Corrected public-facing 'Velocity Vercs' typo to **Velocity Verse**.
- Replaced favicon and social share fallback with the new brand.
- Removed the Next.js developer indicator from the page.
- Softened the heavy black radial hero overlay.
- Added authorized `/api/media/upload` image uploads with file-type and size checks.
- Added persistent file delivery via `/api/media/YYYY/MM/<uuid>.jpg` (and PNG, AVIF, WebP).
- Added a gallery DB column and automatic migration for previously saved articles.
- Enabled 10-image galleries in both the normal editor and quick-post editor.
- Added a responsive gallery carousel to published articles.
- Recovered sample photo assets from cached optimized imagery available in the source ZIP.

## Data, deployment, backups, and security

- Article metadata: `data/velocity_verse.db` (SQLite).
- Uploaded originals: `data/uploads/YYYY/MM/`.
- **Back up both the SQLite database AND the uploads folder** to preserve articles and photos.
- `data/` must be persistent and writable. **Vercel/serverless ephemeral disk is not suitable** for this local-disk uploader. For such deployment, switch to durable object storage (Cloudinary, S3 or R2) plus an appropriate hosted database.
- Only signed-in admin/editor/author accounts can upload photos. The admin password reset command is included to replace any previous demo admin credentials.
- Do not commit `.env.local`. Set a new secret and password before hosting publicly.
- The uploaded source ZIP was incomplete: the exact original high-resolution `public/images` files were inaccessible. This package includes working optimized recovered images, but if you still have the original assets on your PC, replace those images in `public/images/` to restore their maximum quality.

## Notes

This package contains application source and demo media, not `node_modules`, `.next`, or the original ZIP's large build cache. Dependencies are installed with `npm install`. TypeScript/TSX source syntax was checked, but a full browser production build was not executed in the artifact creation environment.
