const typeDefs = `#graphql
  type Patient {
    id: ID!
    name: String
    age: Int
    gender: String
    address: String
    phone: String
    disease: String
  }

  type Medicine {
    id: ID!
    patient: Patient
    patient_id: ID!
    name: String
    dosage: String
    instructions: String
    status: String
    notes: String
  }

  type Query {
    # Medicine Queries
    medicines: [Medicine]
    medicine(id: ID!): Medicine
  }

  type Mutation {
    # Medicine Mutations
    createMedicine(patient_id: ID!, name: String!, dosage: String, instructions: String, status: String, notes: String): Medicine
    updateMedicine(id: ID!, patient_id: ID, name: String, dosage: String, instructions: String, status: String, notes: String): Medicine
    deleteMedicine(id: ID!): String
  }
`;

module.exports = typeDefs;