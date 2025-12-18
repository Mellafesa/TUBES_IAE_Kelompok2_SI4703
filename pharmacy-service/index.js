const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const path = require('path');
const db = require('./models');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const app = express();
const PORT = 4004; // Port untuk service pharmacy

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Buat schema GraphQL
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Middleware untuk GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, // Aktifkan GraphiQL untuk testing
}));

// Serve index.html for frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Sinkronisasi database dan jalankan server
(async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log('✅ Database Farmasi berhasil tersinkronisasi');

    app.listen(PORT, () => {
      console.log(`🚀 Service pharmacy berjalan di http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('❌ Gagal menjalankan service pharmacy:', error);
  }
})();