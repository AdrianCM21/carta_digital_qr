/* Lectura de archivos del usuario. */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});

  /** Lee una imagen, la reduce a `maxSize` px y devuelve un data URL (para guardarla liviana). `mime` opcional (ej. image/jpeg). */
  H.imageToDataUrl = function (file, maxSize, mime) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('El archivo no es una imagen'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Imagen inválida'));
        img.onload = () => {
          const k = Math.min(1, maxSize / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * k));
          c.height = Math.max(1, Math.round(img.height * k));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL(mime || 'image/png', 0.82));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };
})(window);
