# 🛒 OLIVOMARKET - E-commerce Platform

![CI](https://github.com/fabricioseidel/PruebaWeb1/actions/workflows/ci.yml/badge.svg)

Una plataforma de comercio electrónico completa construida con Next.js 15, TypeScript y Prisma. Incluye panel administrativo, autenticación de usuarios, carrito de compras y sistema de gestión de productos.

## 🚀 Características Principales

### 👥 **Para Usuarios:**
- ✅ Catálogo de productos con categorías
- ✅ Carrito de compras persistente
- ✅ Proceso de checkout completo
- ✅ Autenticación y registro de usuarios
- ✅ Panel de usuario (pedidos, perfil, direcciones)
- ✅ Diseño responsive optimizado para móviles

### 🔧 **Para Administradores:**
- ✅ Panel administrativo completo
- ✅ Gestión de productos y categorías
- ✅ Administración de usuarios
- ✅ Control de pedidos y inventario
- ✅ Subida de imágenes
- ✅ Configuración del sistema

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** SQLite (desarrollo), compatible con PostgreSQL/MySQL
- **Autenticación:** NextAuth.js
- **Testing:** Vitest + Testing Library
- **Deployment:** Vercel (recomendado)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/fabricioseidel/PruebaWeb1.git
cd PruebaWeb1
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Variables de entorno
1. Copia `.env.example` → `.env.local` y completa valores reales:
   - `NEXTAUTH_URL=http://localhost:3000`
   - `NEXTAUTH_SECRET=<string seguro>`
   - `AUTH_TRUST_HOST=true`
   - `DATABASE_URL="file:./dev.db"`

### 4. Configurar la base de datos
```bash
# Generar cliente Prisma
npx prisma generate
# Aplicar schema a la base de datos
npx prisma db push        # o npx prisma migrate dev -n seed
```

### 5. Seed de desarrollo
```bash
# Poblar con productos base OlivoMarket
npm run seed
```

### 6. Ejecutar en desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

**Estado actual:** 6/6 tests pasando ✅

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel administrativo
│   ├── api/               # API Routes
│   ├── carrito/           # Carrito de compras
│   ├── productos/         # Catálogo de productos
│   └── ...
├── components/            # Componentes reutilizables
│   ├── layout/           # Header, Footer, Navbar
│   ├── ui/               # Componentes UI (Button, Input, etc)
│   └── admin/            # Componentes del admin
├── contexts/             # React Contexts (Cart, Products, etc)
├── lib/                  # Configuraciones (Prisma, Auth)
├── hooks/                # Custom hooks
├── utils/                # Utilidades
└── __tests__/            # Tests unitarios
```

## 🔐 Credenciales por Defecto

**Administrador:**
- Email: admin@example.com
- Password: admin123

**Usuario de prueba:**
- Email: user@example.com  
- Password: user123

## 📊 Características Técnicas

- **✅ SSR/SSG:** Optimizado para SEO
- **✅ TypeScript:** Tipado estático completo
- **✅ Responsive Design:** Mobile-first approach
- **✅ API RESTful:** Endpoints bien documentados
- **✅ Error Handling:** Manejo robusto de errores
- **✅ Testing:** Cobertura de tests automatizados (16/16 pruebas pasando)
- **✅ Performance:** Optimizado con Next.js 15
- **✅ CI/CD:** Pipeline completo en GitHub Actions
- **✅ Database Seeding:** Datos de prueba de OlivoMarket

## 🛡️ Estado de Calidad

### ✅ Métricas del Proyecto
- **Build**: ✅ Compilación exitosa sin errores
- **TypeScript**: ✅ Verificación de tipos completa
- **Tests**: ✅ 16/16 pruebas unitarias pasando
- **Linting**: ⚠️ Advertencias menores (no críticas)
- **Database**: ✅ Esquema many-to-many funcional
- **Seed Data**: ✅ 15 productos, 9 categorías de OlivoMarket

### 🗂️ Arquitectura de Datos
```
Product ←→ ProductCategory ←→ Category (many-to-many)
User → Order → OrderItem → Product
User → Cart → CartItem → Product
```

## 🚀 Deployment

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Manual
```bash
npm run build
npm start
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run test         # Ejecutar tests
npm run test:coverage # Tests con coverage
npm run lint         # ESLint
npm run typecheck    # Verificación TypeScript
npm run seed         # Poblar DB con productos OlivoMarket
npm run db:push      # Sincronizar schema DB
```

## 📈 Métricas de Calidad

- **Tests:** 6/6 pasando ✅
- **TypeScript:** 100% tipado ✅
- **ESLint:** Sin errores ✅
- **Performance:** Optimizado ✅
- **Accessibility:** WCAG compliant ✅

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Crear Pull Request

## 📝 Changelog

### v1.0.0 (Agosto 2025)
- ✅ Versión inicial completa
- ✅ E-commerce funcional
- ✅ Panel administrativo
- ✅ Testing automatizado
- ✅ Documentación completa

## 📞 Soporte

Para soporte, crea un [issue](https://github.com/fabricioseidel/PruebaWeb1/issues) o contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ usando Next.js + TypeScript**
