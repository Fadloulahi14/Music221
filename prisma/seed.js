const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Professeurs
  const prof1 = await prisma.professeur.upsert({
    where: { email: 'amadou.diallo@music221.sn' },
    update: {},
    create: {
      prenom: 'Amadou',
      nom: 'Diallo',
      email: 'amadou.diallo@music221.sn',
      telephone: '+221701234567',
      instrumentPrincipal: 'Piano',
    },
  });

  const prof2 = await prisma.professeur.upsert({
    where: { email: 'fatou.sow@music221.sn' },
    update: {},
    create: {
      prenom: 'Fatou',
      nom: 'Sow',
      email: 'fatou.sow@music221.sn',
      telephone: '+221709876543',
      instrumentPrincipal: 'Guitare',
    },
  });

  // Élèves
  const eleve1 = await prisma.eleve.upsert({
    where: { email: 'ibrahima.ndiaye@email.com' },
    update: {},
    create: {
      prenom: 'Ibrahima',
      nom: 'Ndiaye',
      email: 'ibrahima.ndiaye@email.com',
      telephone: '+221771112233',
      dateNaissance: new Date('2005-03-15'),
      niveau: 'DEBUTANT',
    },
  });

  const eleve2 = await prisma.eleve.upsert({
    where: { email: 'mariama.ba@email.com' },
    update: {},
    create: {
      prenom: 'Mariama',
      nom: 'Ba',
      email: 'mariama.ba@email.com',
      telephone: '+221772223344',
      dateNaissance: new Date('2000-07-22'),
      niveau: 'INTERMEDIAIRE',
    },
  });

  // Instruments
  const instr1 = await prisma.instrument.upsert({
    where: { code: 'PIANO-001' },
    update: {},
    create: {
      code: 'PIANO-001',
      nom: 'Piano Yamaha',
      statut: 'DISPONIBLE',
      valeurEstimee: 2500000,
    },
  });

  const instr2 = await prisma.instrument.upsert({
    where: { code: 'GUITAR-001' },
    update: {},
    create: {
      code: 'GUITAR-001',
      nom: 'Guitare Acoustique',
      statut: 'DISPONIBLE',
      valeurEstimee: 350000,
    },
  });

  await prisma.instrument.upsert({
    where: { code: 'VIOLIN-001' },
    update: {},
    create: {
      code: 'VIOLIN-001',
      nom: 'Violon 4/4',
      statut: 'HORS_SERVICE',
      valeurEstimee: 800000,
    },
  });

  // Cours planifié
  const futur = new Date();
  futur.setDate(futur.getDate() + 3);

  await prisma.cours.create({
    data: {
      eleveId: eleve1.id,
      professeurId: prof1.id,
      instrumentId: instr1.id,
      dateHeure: futur,
      duree: 60,
      statut: 'PLANIFIE',
    },
  });

  console.log('✅ Seeding terminé !');
  console.log(`   - ${await prisma.professeur.count()} professeurs`);
  console.log(`   - ${await prisma.eleve.count()} élèves`);
  console.log(`   - ${await prisma.instrument.count()} instruments`);
  console.log(`   - ${await prisma.cours.count()} cours`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
