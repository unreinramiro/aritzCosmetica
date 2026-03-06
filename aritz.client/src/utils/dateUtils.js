// Función auxiliar para formatear la fecha (ej: "Lunes 12/03")
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    }).format(date);
};

export const calculateDeliveryRange = (zipCode) => {
    if (!zipCode) return null;

    const cp = parseInt(zipCode);
    const today = new Date();

    // Configuración de Días de demora (Mínimo, Máximo)
    let minDays = 4;
    let maxDays = 7;

    // Lógica por Zonas (Ajusta según tu criterio real)
    if (cp >= 1000 && cp <= 1899) {
        // CABA y GBA (Rápido)
        minDays = 2;
        maxDays = 3;
    } else if (cp >= 1900 && cp <= 2999) {
        // Santa Fe / Provincia BsAs
        minDays = 3;
        maxDays = 5;
    } else if (cp >= 5000 && cp <= 5999) {
        // Córdoba
        minDays = 3;
        maxDays = 6;
    } else if (cp >= 9000) {
        // Patagonia / Tierra del Fuego (Lento)
        minDays = 7;
        maxDays = 12;
    }
    // ... resto del país queda con el default (4-7)

    // Crear objetos de fecha
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    return {
        start: formatDate(minDate),
        end: formatDate(maxDate)
    };
};