const { Medicine } = require('../models');
const { getPatientById, getPatientsByIds } = require('../services/adminService');

const resolvers = {
  Query: {
    // Medicine Queries
    medicines: async () => {
      return await Medicine.findAll(); 
    },
    medicine: async (_, { id }) => {
      return await Medicine.findByPk(id);
    }
  },

  Mutation: {
    // Medicine Mutations
    createMedicine: async (_, args) => {
      // Verify patient exists in admin service
      const patient = await getPatientById(args.patient_id);
      if (!patient) {
        throw new Error(`Patient with ID ${args.patient_id} not found in admin service`);
      }

      const newMed = await Medicine.create({
        patient_id: args.patient_id, 
        name: args.name,
        dosage: args.dosage,
        instructions: args.instructions,
        status: args.status || 'Pending',
        notes: args.notes
      });
      return newMed;
    },

    updateMedicine: async (_, { id, ...args }) => {
      // Verify patient exists if patient_id is being updated
      if (args.patient_id !== undefined) {
        const patient = await getPatientById(args.patient_id);
        if (!patient) {
          throw new Error(`Patient with ID ${args.patient_id} not found in admin service`);
        }
      }

      // Hanya update field yang diberikan (tidak undefined)
      const updateData = {};
      if (args.patient_id !== undefined) updateData.patient_id = args.patient_id;
      if (args.name !== undefined) updateData.name = args.name;
      if (args.dosage !== undefined) updateData.dosage = args.dosage;
      if (args.instructions !== undefined) updateData.instructions = args.instructions;
      if (args.status !== undefined) updateData.status = args.status;
      if (args.notes !== undefined) updateData.notes = args.notes;

      await Medicine.update(updateData, { where: { id } });
      return await Medicine.findByPk(id);
    },

    deleteMedicine: async (_, { id }) => {
      const deleted = await Medicine.destroy({ where: { id } });
      return deleted ? "Obat berhasil dihapus" : "Gagal: ID tidak ditemukan";
    }
  },

  Medicine: {
    // Fetch patient data from admin service
    patient: async (parent) => {
      if (!parent.patient_id) {
        return null;
      }
      const patient = await getPatientById(parent.patient_id);
      return patient;
    }
  }
};

module.exports = resolvers;