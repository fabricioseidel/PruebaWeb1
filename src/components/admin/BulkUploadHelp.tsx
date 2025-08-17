"use client";

import { useState } from "react";
import { DocumentArrowDownIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

export default function BulkUploadHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const downloadExample = (format: 'csv' | 'json') => {
    const url = format === 'csv' 
      ? '/plantillas/productos-ejemplo.csv'
      : '/plantillas/productos-ejemplo.json';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos-ejemplo.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex items-start space-x-3">
        <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900">
            Carga Masiva de Productos
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            Sube múltiples productos a la vez usando archivos CSV o JSON
          </p>
          
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="font-medium text-blue-900">Formatos soportados:</h4>
              <ul className="mt-1 text-sm text-blue-700 space-y-1">
                <li>• <strong>CSV:</strong> Archivo de texto separado por comas</li>
                <li>• <strong>JSON:</strong> Archivo de datos estructurados</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-900">Campos requeridos:</h4>
              <div className="mt-1 text-sm text-blue-700 grid grid-cols-2 gap-x-4 gap-y-1">
                <div><strong>name:</strong> Nombre del producto</div>
                <div><strong>description:</strong> Descripción</div>
                <div><strong>price:</strong> Precio (número)</div>
                <div><strong>stock:</strong> Inventario</div>
                <div><strong>categories:</strong> Categorías (separadas por ;)</div>
                <div><strong>image:</strong> URL de imagen (opcional)</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => downloadExample('csv')}
                size="sm"
                variant="outline"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Descargar CSV
              </Button>
              <Button
                onClick={() => downloadExample('json')}
                size="sm"
                variant="outline"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Descargar JSON
              </Button>
            </div>

            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              💡 <strong>Tip:</strong> Los archivos de ejemplo incluyen 20 productos venezolanos listos para usar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
