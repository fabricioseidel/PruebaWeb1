const fs = require('fs');

// Leer el archivo CSV
const csvContent = `nombre,descripcion,precio,stock,categorias,imagen,destacado
Harina de Arepas Blanca,"Harina precocida para arepas venezolanas, perfecta para el desayuno",3.50,100,"Venezolanos;Harinas;Abarrotes",/productos/harina-arepas.jpg,false
Queso Guayanés,"Queso fresco venezolano, ideal para arepas y tequeños",8.99,50,"Venezolanos;Lácteos;Quesos",/productos/queso-guayanes.jpg,true
Aceite de Girasol 1L,"Aceite vegetal premium para cocinar",4.25,75,"Abarrotes;Aceites;Cocina",/productos/aceite-girasol.jpg,false`;

// Parsear CSV a productos
function parseCSV(csvData) {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;
    
    const product = {
      name: values[0] || '',
      description: values[1] ? values[1].replace(/"/g, '') : '',
      price: parseFloat(values[2]) || 0,
      stock: parseInt(values[3]) || 0,
      categories: values[4] ? values[4].replace(/"/g, '').split(';').map(c => c.trim()) : [],
      image: values[5] || '/file.svg'
    };

    if (product.name) {
      products.push(product);
    }
  }
  return products;
}

// Función para hacer la petición
async function uploadProducts() {
  try {
    const products = parseCSV(csvContent);
    console.log('Productos parseados:', products.length);
    console.log('Primer producto:', products[0]);

    const response = await fetch('http://localhost:3003/api/products/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products }),
    });

    const result = await response.json();
    console.log('Resultado:', result);

    if (response.ok) {
      console.log(`✅ ${result.success} productos creados exitosamente`);
      if (result.createdCategories.length > 0) {
        console.log(`✅ Categorías creadas: ${result.createdCategories.join(', ')}`);
      }
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

uploadProducts();
