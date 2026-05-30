import { defineConfig } from 'vite';

// Railway injects the public port via the PORT env var. `vite preview` must
// bind to 0.0.0.0 on that port, and Railway serves traffic through its own
// domain, so we allow all hosts for the preview server.
const port = Number(process.env.PORT) || 4173;

export default defineConfig({
  preview: {
    host: true,        // listen on 0.0.0.0 so Railway can reach the container
    port,
    strictPort: true,
    allowedHosts: true // accept Railway's *.up.railway.app (and custom) domains
  },
  server: {
    host: true,
    port
  }
});
