const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const path = require('path');
const db = require('./models');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const app = express();

// ⚠️ WAJIB untuk Docker
const PORT = process.env.PORT || 4004;

// ==============================
// Serve Frontend
// ==============================
app.use(express.static(path.join(__dirname, 'frontend')));

// ==============================
// GraphQL Schema
// ==============================
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// ==============================
// GraphQL Endpoint
// ==============================
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, // SESUAI TOR
}));

// ==============================
// Root Route
// ==============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ==============================
// Start Server
// ==============================
(async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log('✅ Database Farmasi berhasil tersinkronisasi');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Service pharmacy berjalan di http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('❌ Gagal menjalankan service pharmacy:', error);
  }
})();
