'use strict';
require('dotenv').config();
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');

const PORT = env.PORT || 3000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    app.listen(PORT, () => {
      console.log('');
      console.log('🎵 ════════════════════════════════════════════ 🎵');
      console.log(`   MUSIC 221 API démarrée`);
      console.log(`   → Serveur   : http://localhost:${PORT}`);
      console.log(`   → Santé     : http://localhost:${PORT}/health`);
      console.log(`   → Swagger   : http://localhost:${PORT}/api-docs`);
      console.log('🎵 ════════════════════════════════════════════ 🎵');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Échec du démarrage :', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
