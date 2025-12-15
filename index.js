const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const sequelize = require('./db');

// --- IMPORT MODELS ---
const Patient = require('./models/patient');
const Doctor = require('./models/doctor');
const Record = require('./models/record');
const Appointment = require('./models/appointment');
const Medicine = require('./models/medicine');

// --- 1. DEFINISI RELASI DENGAN ALIAS (Supaya kebaca GraphQL) ---

// Pasien <-> Record
Patient.hasMany(Record, { foreignKey: 'patient_id', as: 'records' });
Record.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Dokter <-> Record
Doctor.hasMany(Record, { foreignKey: 'doctor_id', as: 'records' });
Record.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Pasien <-> Appointment
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Dokter <-> Appointment
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Pasien <-> Obat (Farmasi)
Patient.hasMany(Medicine, { foreignKey: 'patient_id', as: 'medicines' });
Medicine.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });


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
    medicines: [Medicine]
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

  type Medicine {
    id: ID!
    patient: Patient
    name: String
    dosage: String
    instructions: String
    status: String
    notes: String
  }

  type Query {
    patients: [Patient]
    doctors: [Doctor]
    records: [Record]
    appointments: [Appointment]
    medicines: [Medicine]

    patient(id: ID!): Patient
    doctor(id: ID!): Doctor
    record(id: ID!): Record
    appointment(id: ID!): Appointment
  }

  type Mutation {
    # --- PATIENT ---
    createPatient(name: String!, age: Int, gender: String, disease: String, address: String): Patient
    updatePatient(id: ID!, name: String, age: Int, disease: String, address: String): Patient
    deletePatient(id: ID!): String

    # --- DOCTOR ---
    createDoctor(name: String!, specialty: String!, contact: String): Doctor
    updateDoctor(id: ID!, name: String, specialty: String, contact: String): Doctor
    deleteDoctor(id: ID!): String

    # --- RECORD ---
    createRecord(patient_id: ID!, doctor_id: ID!, diagnosis: String, treatment: String, visit_date: String): Record
    updateRecord(id: ID!, diagnosis: String, treatment: String): Record
    deleteRecord(id: ID!): String

    # --- APPOINTMENT ---
    createAppointment(patient_id: ID!, doctor_id: ID!, appointments_date: String, appointments_time: String, reason: String, status: String): Appointment
    updateAppointment(id: ID!, status: String, appointments_date: String, appointments_time: String, reason: String): Appointment
    deleteAppointment(id: ID!): String

    # --- MEDICINE ---
    createMedicine(
      patient_id: ID!, 
      name: String!, 
      dosage: String, 
      instructions: String, 
      status: String, 
      notes: String
    ): Medicine
    
    updateMedicineStatus(id: ID!, status: String!): Medicine
    deleteMedicine(id: ID!): String
  }
`;

// --- 3. RESOLVERS (LOGIKA DENGAN INCLUDE ALIAS) ---
const resolvers = {
  Query: {
    patients: async () => await Patient.findAll({ 
      include: [
        { model: Record, as: 'records' }, 
        { model: Appointment, as: 'appointments' }, 
        { model: Medicine, as: 'medicines' }
      ] 
    }),
    patient: async (_, { id }) => await Patient.findByPk(id, { 
      include: [
        { model: Record, as: 'records' }, 
        { model: Appointment, as: 'appointments' }, 
        { model: Medicine, as: 'medicines' }
      ] 
    }),
    
    doctors: async () => await Doctor.findAll({ 
      include: [{ model: Appointment, as: 'appointments' }] 
    }),
    doctor: async (_, { id }) => await Doctor.findByPk(id, {
      include: [{ model: Appointment, as: 'appointments' }] 
    }),
    
    records: async () => await Record.findAll({ 
      include: [
        { model: Patient, as: 'patient' }, 
        { model: Doctor, as: 'doctor' }
      ] 
    }),
    record: async (_, { id }) => await Record.findByPk(id, { 
      include: [
        { model: Patient, as: 'patient' }, 
        { model: Doctor, as: 'doctor' }
      ] 
    }),
    
    appointments: async () => await Appointment.findAll({ 
      include: [
        { model: Patient, as: 'patient' }, 
        { model: Doctor, as: 'doctor' }
      ] 
    }),
    appointment: async (_, { id }) => await Appointment.findByPk(id, { 
      include: [
        { model: Patient, as: 'patient' }, 
        { model: Doctor, as: 'doctor' }
      ] 
    }),

    medicines: async () => await Medicine.findAll({ 
      include: [{ model: Patient, as: 'patient' }] 
    }),
  },
  
  Mutation: {
    // PATIENT
    createPatient: async (_, args) => await Patient.create(args),
    updatePatient: async (_, { id, ...args }) => {
      await Patient.update(args, { where: { id } });
      return await Patient.findByPk(id);
    },
    deletePatient: async (_, { id }) => {
      await Patient.destroy({ where: { id } });
      return "Patient deleted";
    },

    // DOCTOR
    createDoctor: async (_, args) => await Doctor.create(args),
    updateDoctor: async (_, { id, ...args }) => {
      await Doctor.update(args, { where: { id } });
      return await Doctor.findByPk(id);
    },
    deleteDoctor: async (_, { id }) => {
      await Doctor.destroy({ where: { id } });
      return "Doctor deleted";
    },

    // RECORD
    createRecord: async (_, args) => await Record.create(args),
    updateRecord: async (_, { id, ...args }) => {
      await Record.update(args, { where: { id } });
      return await Record.findByPk(id);
    },
    deleteRecord: async (_, { id }) => {
      await Record.destroy({ where: { id } });
      return "Record deleted";
    },

    // APPOINTMENT
    createAppointment: async (_, args) => await Appointment.create(args),
    updateAppointment: async (_, { id, ...args }) => {
      await Appointment.update(args, { where: { id } });
      return await Appointment.findByPk(id);
    },
    deleteAppointment: async (_, { id }) => {
      await Appointment.destroy({ where: { id } });
      return "Appointment deleted";
    },

    // MEDICINE (FARMASI)
    createMedicine: async (_, args) => {
      // 1. Simpan
      const newMed = await Medicine.create({
        ...args,
        patient_id: args.patient_id // Paksa ID masuk
      });
      
      // 2. Ambil Ulang dengan ALIAS patient
      const medWithPatient = await Medicine.findByPk(newMed.id, {
        include: [{ model: Patient, as: 'patient' }] 
      });
      
      return medWithPatient;
    },
    
    updateMedicineStatus: async (_, { id, status }) => {
      await Medicine.update({ status }, { where: { id } });
      return await Medicine.findByPk(id, { 
        include: [{ model: Patient, as: 'patient' }] 
      });
    },
    
    deleteMedicine: async (_, { id }) => {
      await Medicine.destroy({ where: { id } });
      return "Medicine deleted";
    }
  }
};

// --- 4. SERVER SETUP ---
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

const PORT = 5000;

// Ganti ke { alter: true } karena tabel sudah pernah di-reset
sequelize.sync({ alter: true }) 
  .then(() => {
    console.log("✅ Database Synced with Aliases!");
    app.listen(PORT, () => {
      console.log(`🚀 Server Medihub running at http://localhost:${PORT}/graphql`);
    });
  })
  .catch(err => {
    console.error("❌ Database Connection Error:", err);
  });