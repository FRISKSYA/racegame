# Runbook

## Deployment

### Build

```bash
make build
# Output: dist/
```

### Serve Static Files

Deploy `dist/` to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- S3 + CloudFront

### Verify Build

```bash
make build
npx vite preview
# Open http://localhost:4173
```

## Troubleshooting

### Build Fails

```bash
# Check TypeScript errors
make typecheck

# Check for lint issues
make lint

# Clean and rebuild
make clean && npm install && make build
```

### Tests Fail

```bash
# Run specific test file
npx vitest run src/core/physics/simple-physics.test.ts

# Run with verbose output
npx vitest --reporter=verbose
```

### Game Not Loading

1. Check browser console for errors
2. Verify Canvas 2D support
3. Clear browser cache

## Performance

### Bundle Size

```bash
make build
# Check dist/assets/*.js size
```

Current: ~78 KB gzip (includes Zod)

### Profiling

1. Open browser DevTools
2. Performance tab → Record
3. Play game for 10 seconds
4. Analyze frame timing

Target: 60 FPS stable
