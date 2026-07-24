const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Crear áreas predefinidas
  const areas = [
    'Área 1 - Dirección General',
    'Área 2 - Recursos Humanos',
    'Área 3 - Administración',
    'Área 4 - Tesorería',
    'Área 5 - Contabilidad',
    'Área 6 - Atención al Público',
    'Área 7 - Jurídico',
    'Área de Tecnologías'
  ];

  const areasCreadas = [];
  for (const nombre of areas) {
    const area = await prisma.areas.upsert({
      where: { nombre },
      update: {},
      create: { nombre }
    });
    areasCreadas.push(area);
    console.log(`Área creada: ${area.nombre}`);
  }

  // Crear usuario admin (Área de Tecnologías)
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuarios.upsert({
    where: { email: 'admin@soporte.com' },
    update: {},
    create: {
      nombre: 'Administrador General',
      email: 'admin@soporte.com',
      password: passwordAdmin,
      rol: 'admin',
      area_id: areasCreadas[7].id // Área de Tecnologías
    }
  });
  console.log(`Admin creado: ${admin.email}`);

  // Crear enlaces para cada área
  const enlaces = [
    { nombre: 'Juan Pérez', email: 'enlace1@soporte.com', areaIndex: 0 },
    { nombre: 'María García', email: 'enlace2@soporte.com', areaIndex: 1 },
    { nombre: 'Carlos López', email: 'enlace3@soporte.com', areaIndex: 2 },
    { nombre: 'Ana Martínez', email: 'enlace4@soporte.com', areaIndex: 3 },
    { nombre: 'Pedro Sánchez', email: 'enlace5@soporte.com', areaIndex: 4 },
    { nombre: 'Laura Rodríguez', email: 'enlace6@soporte.com', areaIndex: 5 },
    { nombre: 'Miguel Hernández', email: 'enlace7@soporte.com', areaIndex: 6 }
  ];

  const passwordEnlace = await bcrypt.hash('enlace123', 10);
  for (const enlace of enlaces) {
    const usuario = await prisma.usuarios.upsert({
      where: { email: enlace.email },
      update: {},
      create: {
        nombre: enlace.nombre,
        email: enlace.email,
        password: passwordEnlace,
        rol: 'enlace',
        area_id: areasCreadas[enlace.areaIndex].id
      }
    });

    // Asignar enlace al área
    await prisma.areas.update({
      where: { id: areasCreadas[enlace.areaIndex].id },
      data: { enlace_id: usuario.id }
    });

    console.log(`Enlace creado: ${usuario.nombre} - ${areasCreadas[enlace.areaIndex].nombre}`);
  }

  // Crear técnico de ejemplo
  const passwordTecnico = await bcrypt.hash('tecnico123', 10);
  const tecnico = await prisma.usuarios.upsert({
    where: { email: 'tecnico@soporte.com' },
    update: {},
    create: {
      nombre: 'Técnico Soporte',
      email: 'tecnico@soporte.com',
      password: passwordTecnico,
      rol: 'tecnico',
      area_id: areasCreadas[7].id // Área de Tecnologías
    }
  });
  console.log(`Técnico creado: ${tecnico.email}`);

  console.log('\n✅ Seed completado exitosamente!');
  console.log('\nCredenciales de acceso:');
  console.log('Admin: admin@soporte.com / admin123');
  console.log('Enlaces: enlace1-7@soporte.com / enlace123');
  console.log('Técnico: tecnico@soporte.com / tecnico123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
