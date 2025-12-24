const db = require('../models');
const { Patient, Doctor, Record, Appointment } = db;

const resolvers = {
  Query: {
    patients: async () => await Patient.findAll({ 
      include: [
        { model: Record, as: 'records' }, 
        { model: Appointment, as: 'appointments' }
      ] 
    }),
    patient: async (_, { id }) => await Patient.findByPk(id, { 
      include: [
        { model: Record, as: 'records' }, 
        { model: Appointment, as: 'appointments' }
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
  },
  
  Mutation: {
    createPatient: async (_, args) => {
      return await Patient.create(args);
    },
    updatePatient: async (_, { id, ...args }) => {
      await Patient.update(args, { where: { id } });
      return await Patient.findByPk(id, {
        include: [
          { model: Record, as: 'records' }, 
          { model: Appointment, as: 'appointments' }
        ]
      });
    },
    deletePatient: async (_, { id }) => {
      await Appointment.destroy({ where: { patient_id: id } });
      await Record.destroy({ where: { patient_id: id } });
      
      const deleted = await Patient.destroy({ where: { id } });
      
      return deleted ? "Patient dan data terkait berhasil dihapus" : "Gagal: ID tidak ditemukan";
    },
    
    createDoctor: async (_, args) => {
      return await Doctor.create(args);
    },
    updateDoctor: async (_, { id, ...args }) => {
      await Doctor.update(args, { where: { id } });
      return await Doctor.findByPk(id, {
        include: [{ model: Appointment, as: 'appointments' }]
      });
    },
    deleteDoctor: async (_, { id }) => {
      const deleted = await Doctor.destroy({ where: { id } });
      return deleted ? "Doctor berhasil dihapus" : "Gagal: ID tidak ditemukan";
    },
    
    
    createRecord: async (_, args) => {
      const newRecord = await Record.create(args);
      
      return await Record.findByPk(newRecord.id, {
        include: [
          { model: Patient, as: 'patient' }, 
          { model: Doctor, as: 'doctor' }
        ]
      });
    },

    updateRecord: async (_, { id, ...args }) => {
      await Record.update(args, { where: { id } });
      return await Record.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' }, 
          { model: Doctor, as: 'doctor' }
        ]
      });
    },
    deleteRecord: async (_, { id }) => {
      const deleted = await Record.destroy({ where: { id } });
      return deleted ? "Record berhasil dihapus" : "Gagal: ID tidak ditemukan";
    },
    
    createAppointment: async (_, args) => {
      const newAppt = await Appointment.create({
        ...args,
        status: args.status || 'Scheduled'
      });
      
      return await Appointment.findByPk(newAppt.id, {
        include: [
          { model: Patient, as: 'patient' }, 
          { model: Doctor, as: 'doctor' }
        ]
      });
    },

    updateAppointment: async (_, { id, ...args }) => {
      await Appointment.update(args, { where: { id } });
      return await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' }, 
          { model: Doctor, as: 'doctor' }
        ]
      });
    },
    deleteAppointment: async (_, { id }) => {
      const deleted = await Appointment.destroy({ where: { id } });
      return deleted ? "Appointment berhasil dihapus" : "Gagal: ID tidak ditemukan";
    }
  }
};

module.exports = resolvers;