const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const sequelize = require('./db');

// --- IMPORT MODELS (Sesuai nama file kamu) ---
const Patient = require('./models/patient');
const Doctor = require('./models/doctor');
const Record = require('./models/record');
const Appointment = require('./models/appointment');

// --- 1. DEFINISI RELASI (ASSOCIATIONS) ---
// Pasien -> Record
Patient.hasMany(Record, { foreignKey: 'patient_id' });
Record.belongsTo(Patient, { foreignKey: 'patient_id' });

// Dokter -> Record
Doctor.hasMany(Record, { foreignKey: 'doctor_id' });
Record.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// Pasien -> Appointment
Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });

// Dokter -> Appointment
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// --- 2. TYPE DEFS (SCHEMA GRAPHQL) ---
const typeDefs = `
  type Patient {
    id: ID!
    name: String
    age: Int
    gender: String
    disease: String
    address: String
    records: [Record]
    appointments: [Appointment]
  }

  type Doctor {
    id: ID!
    name: String
    specialty: String
    contact: String
    appointments: [Appointment]
  }

  type Record {
    id: ID!
    patient: Patient
    doctor: Doctor
    diagnosis: String
    treatment: String
    visit_date: String
  }

  type Appointment {
    id: ID!
    patient: Patient
    doctor: Doctor
    appointments_date: String
    appointments_time: String
    reason: String
    status: String
  }

  type Query {
    patients: [Patient]
    patient(id: ID!): Patient
    doctors: [Doctor]
    doctor(id: ID!): Doctor
    records: [Record]
    record(id: ID!): Record
    appointments: [Appointment]
  }

  type Mutation {
    createPatient(name: String!, age: Int, gender: String, disease: String, address: String): Patient
    deletePatient(id: ID!): String
    
    createDoctor(name: String!, specialty: String!, contact: String): Doctor
    
    createRecord(patient_id: ID!, doctor_id: ID!, diagnosis: String, treatment: String, visit_date: String): Record
    
    createAppointment(patient_id: ID!, doctor_id: ID!, appointments_date: String, appointments_time: String, reason: String, status: String): Appointment
  }
`;

// --- 3. RESOLVERS (LOGIKA DATA) ---
const resolvers = {
  Query: {
    patients: async () => await Patient.findAll({ include: [Record, Appointment] }),
    patient: async (_, { id }) => await Patient.findByPk(id, { include: [Record, Appointment] }),
    
    doctors: async () => await Doctor.findAll({ include: [Appointment] }),
    doctor: async (_, { id }) => await Doctor.findByPk(id),
    
    records: async () => await Record.findAll({ include: [Patient, Doctor] }),
    record: async (_, { id }) => await Record.findByPk(id, { include: [Patient, Doctor] }),
    
    appointments: async () => await Appointment.findAll({ include: [Patient, Doctor] }),
  },
  
  Mutation: {
    createPatient: async (_, args) => await Patient.create(args),
    deletePatient: async (_, { id }) => {
      await Patient.destroy({ where: { id } });
      return "Patient deleted successfully";
    },

    createDoctor: async (_, args) => await Doctor.create(args),

    createRecord: async (_, args) => await Record.create(args),

    createAppointment: async (_, args) => await Appointment.create(args),
  }
};

// --- 4. SERVER SETUP ---
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true, // Ini yang bikin UI testing muncul
}));

const PORT = 5000;

// Sync Database dulu, baru nyalakan server
sequelize.sync()
  .then(() => {
    console.log("✅ Database Synced & Tables Created!");
    app.listen(PORT, () => {
      console.log(`🚀 Server Medihub running at http://localhost:${PORT}/graphql`);
    });
  })
  .catch(err => {
    console.error("❌ Gagal Konek Database:", err);
  });