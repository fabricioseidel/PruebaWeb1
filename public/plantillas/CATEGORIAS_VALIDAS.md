# Categorías Válidas para Carga Masiva de Productos

## ✅ Categorías Disponibles en el Sistema

Usa **exactamente** estos nombres para evitar errores de concordancia:

### Categorías Principales:
- **Abarrotes** - Productos básicos de despensa
- **Congelados** - Productos congelados y helados  
- **Panadería** - Pan fresco y productos de panadería
- **Quesos** - Quesos artesanales y tradicionales
- **Bebidas** - Refrescos y bebidas
- **Agua** - Agua mineral y con gas
- **Hielo** - Hielo para bebidas y conservación
- **Café** - Café en grano y molido
- **Postres** - Dulces y postres tradicionales

## 📝 Formato para Archivos

### CSV:
```csv
categories
"Abarrotes"
"Bebidas;Postres"  # Múltiples categorías separadas por ;
```

### JSON:
```json
{
  "categories": ["Abarrotes"]
}
// o múltiples:
{
  "categories": ["Panadería", "Postres"]  
}
```

## ⚠️ Importante:
- Los nombres deben coincidir **exactamente** (mayúsculas y tildes)
- Para múltiples categorías en CSV usa el separador `;`
- En JSON usa un array de strings
- Si usas una categoría que no existe, se creará automáticamente

## 🔄 Si Necesitas Nuevas Categorías:
1. Agrégalas primero en el panel de admin
2. O úsalas en el archivo - se crearán automáticamente
3. Recuerda usar nombres descriptivos y consistentes

---
**Última actualización:** Archivo generado automáticamente basado en el schema de la base de datos.
