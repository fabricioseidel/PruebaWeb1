# Cómo aplicar este patch (archivos nuevos, seguros)

1) Descarga y descomprime el ZIP en la **raíz** del repo `PruebaWeb1`.
2) Revisa que ahora existan:
   - `.env.example`
   - `.gitignore` (no subas tu `.env`)
   - `.eslintignore`
   - `.github/workflows/ci.yml`
   - `src/app/robots.ts`
   - `src/app/sitemap.ts`
3) Commit:
   ```bash
   git checkout -b chore/hardening-files
   git add .env.example .gitignore .eslintignore .github/workflows/ci.yml src/app/robots.ts src/app/sitemap.ts
   git commit -m "chore: add env example, git/eslint ignores, CI; feat: robots & sitemap"
   git push origin chore/hardening-files
   ```
4) Abre un Pull Request en GitHub.

## Cambios manuales recomendados (no incluidos en el ZIP)
- **README.md**: corrige la ruta `cd PruebaWeb1` y añade una sección "Variables de entorno" con el paso de copiar `.env.example` a `.env.local`.
- **next.config.ts**: si usas CDN (p. ej., Cloudinary), agrega:
  ```ts
  export default {
    images: {
      domains: ['res.cloudinary.com'],
    },
  }
  ```

> Nota: Nunca subas tu `.env` real. Usa `.env.local` en tu máquina.
