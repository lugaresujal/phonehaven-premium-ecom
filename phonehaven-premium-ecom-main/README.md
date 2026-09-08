# House of Phones — React + Vite SPA

Standard React SPA using Vite + react-router-dom. Preserves the original UI,
Tailwind styles, and page structure from the TanStack Start version.

## Scripts

```bash
npm install
npm run dev      # start dev server
npm run build    # outputs dist/
npm run preview  # preview production build
```

## Deploy

- **Netlify**: `netlify.toml` and `public/_redirects` are included.
- **Shared hosting / VPS**: upload the contents of `dist/` and ensure the
  server rewrites unknown paths to `/index.html` (SPA fallback).

## Notes

`src/lib/tanstack-shim.tsx` is a small compatibility layer so route files
originally written for `@tanstack/react-router` (using `createFileRoute`,
`Link`, `useNavigate`, `notFound`, etc.) work unchanged on top of
`react-router-dom`. All routes are registered in `src/App.tsx`.
