const typeDefs = `#graphql
  type Patient {
    id: ID!
    name: String
    age: Int
    gender: String
    address: String
    phone: String
    disease: String
    records: [Record]
    appointments: [Appointment]
  }

  type Doctor {
    id: ID!
    name: String
    specialization: String
    phone: String
    email: String
    appointments: [Appointment]
  }

  type Record {
    id: ID!
    patient: Patient
    doctor: Doctor
    patient_id: ID!
    doctor_id: ID!
    diagnosis: String
    treatment: String
    notes: String
  }

  type Appointment {
    id: ID!
    patient: Patient
    doctor: Doctor
    patient_id: ID!
    doctor_id: ID!
    date: String
    time: String
    status: String
  }

  # =====================
  # ⬇️ DATA DARI PHARMACY
  # =====================
  type Medicine {
    id: ID!
    name: String!
    stock: Int!
  }

  type Query {
    # Patient Queries
    patients: [Patient]
    patient(id: ID!): Patient
    
    # Doctor Queries
    doctors: [Doctor]
    doctor(id: ID!): Doctor
    
    # Record Queries
    records: [Record]
    record(id: ID!): Record
    
    # Appointment Queries
    appointments: [Appointment]
    appointment(id: ID!): Appointment

    # ⬇️ KOMUNIKASI ANTAR SERVICE
    medicinesFromPharmacy: [Medicine]
  }
  
  type Mutation {
    # Patient Mutations
    createPatient(name: String!, age: Int, gender: String, address: String, phone: String, disease: String): Patient
    updatePatient(id: ID!, name: String, age: Int, gender: String, address: String, phone: String, disease: String): Patient
    deletePatient(id: ID!): String

    # Doctor Mutations
    createDoctor(name: String!, specialization: String, phone: String, email: String): Doctor
    updateDoctor(id: ID!, name: String, specialization: String, phone: String, email: String): Doctor
    deleteDoctor(id: ID!): String

    # Record Mutations
    createRecord(patient_id: ID!, doctor_id: ID!, diagnosis: String, treatment: String, notes: String): Record
    updateRecord(id: ID!, patient_id: ID, doctor_id: ID, diagnosis: String, treatment: String, notes: String): Record
    deleteRecord(id: ID!): String

    # Appointment Mutations
    createAppointment(patient_id: ID!, doctor_id: ID!, date: String, time: String, status: String): Appointment
    updateAppointment(id: ID!, patient_id: ID, doctor_id: ID, date: String, time: String, status: String): Appointment
    deleteAppointment(id: ID!): String
  }
`;

module.exports = typeDefs;
