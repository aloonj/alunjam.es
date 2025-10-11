# alunjam.es Blog

This is a MkDocs-powered blog with the Material theme.

## Project Structure

```
.
├── docs/                  # Markdown content
│   ├── index.md          # Homepage
│   └── posts/            # Blog posts
│       ├── .meta.yml     # Blog metadata
│       └── *.md          # Individual posts
├── site/                 # Built HTML (generated)
├── venv/                 # Python virtual environment
├── mkdocs.yml           # MkDocs configuration
├── build.sh             # Build script
└── alunjam.es.nginx.conf # Nginx configuration
```

## Local Development

### Serve Locally

To run a local development server with live reloading:

```bash
source venv/bin/activate
mkdocs serve
```

Then visit http://127.0.0.1:8000

### Build Site

To build the static site:

```bash
./build.sh
```

Or manually:

```bash
source venv/bin/activate
mkdocs build
```

## Creating Blog Posts

1. Create a new markdown file in `docs/posts/`
2. Add front matter at the top:

```yaml
---
draft: false
date: 2025-10-11
categories:
  - General
---
```

3. Write your content in Markdown
4. Use `<!-- more -->` to mark where the excerpt ends
5. Build the site with `./build.sh`

## Deployment to Nginx

### Initial Setup

1. Copy nginx configuration:
   ```bash
   sudo cp alunjam.es.nginx.conf /etc/nginx/sites-available/alunjam.es
   ```

2. Enable the site:
   ```bash
   sudo ln -sf /etc/nginx/sites-available/alunjam.es /etc/nginx/sites-enabled/
   ```

3. Test nginx configuration:
   ```bash
   sudo nginx -t
   ```

4. Reload nginx:
   ```bash
   sudo systemctl reload nginx
   ```

### Updating the Site

Whenever you make changes:

1. Build the site: `./build.sh`
2. The built files in `site/` are automatically served by nginx

### SSL/HTTPS Setup (Optional)

To enable HTTPS with Let's Encrypt:

1. Install certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain certificate:
   ```bash
   sudo certbot --nginx -d alunjam.es -d www.alunjam.es
   ```

3. Certbot will automatically update your nginx configuration

Alternatively, uncomment the HTTPS section in `alunjam.es.nginx.conf` and manually configure SSL.

## MkDocs Commands

- `mkdocs new [dir-name]` - Create a new project
- `mkdocs serve` - Start live-reloading dev server
- `mkdocs build` - Build the documentation site
- `mkdocs -h` - Print help message

## Customization

Edit `mkdocs.yml` to customize:
- Site name and URL
- Theme colors and features
- Navigation structure
- Plugins and extensions
- And more

For more information, visit:
- [MkDocs documentation](https://www.mkdocs.org/)
- [Material for MkDocs documentation](https://squidfunk.github.io/mkdocs-material/)
