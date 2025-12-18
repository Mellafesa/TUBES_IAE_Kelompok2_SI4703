const API_URL = '/graphql';

// GraphQL helper function
async function graphqlQuery(query, variables = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        // Check if response is ok
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${text}`);
        }

        // Check if response has content
        const text = await response.text();
        if (!text || text.trim() === '') {
            throw new Error('Empty response from server');
        }

        // Parse JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Response text:', text);
            throw new Error(`Invalid JSON response: ${parseError.message}`);
        }

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        return data.data;
    } catch (error) {
        console.error('GraphQL Query Error:', error);
        showMessage(error.message || 'Terjadi kesalahan saat memproses request', 'error');
        throw error;
    }
}

// UI Helper Functions
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        
        // Load data
        loadData(tabName);
    });
});

// Load Data Functions
async function loadData(type) {
    showLoading();
    try {
        switch(type) {
            case 'patients':
                await loadPatients();
                break;
            case 'doctors':
                await loadDoctors();
                break;
            case 'records':
                await loadRecords();
                break;
            case 'appointments':
                await loadAppointments();
                break;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        hideLoading();
    }
}

// PATIENT Functions
async function loadPatients() {
    const query = `
        query {
            patients {
                id
                name
                age
                gender
                address
                phone
                disease
            }
        }
    `;
    const data = await graphqlQuery(query);
    const listEl = document.getElementById('patients-list');
    
    if (!data.patients || data.patients.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><h3>Belum ada data pasien</h3><p>Klik tombol "Tambah Pasien" untuk menambah data</p></div>';
        return;
    }
    
    listEl.innerHTML = data.patients.map(patient => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${patient.name || 'N/A'}</div>
                <div class="card-actions">
                    <button class="btn btn-warning" onclick="editPatient(${patient.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deletePatient(${patient.id})">Hapus</button>
                </div>
            </div>
            <div class="card-body">
                <div class="field">
                    <span class="field-label">Umur</span>
                    <span class="field-value">${patient.age || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Jenis Kelamin</span>
                    <span class="field-value">${patient.gender || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Telepon</span>
                    <span class="field-value">${patient.phone || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Penyakit</span>
                    <span class="field-value">${patient.disease || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Alamat</span>
                    <span class="field-value">${patient.address || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function showPatientForm(patientId = null) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${patientId ? 'Edit' : 'Tambah'} Pasien</h2>
        <form id="patient-form" onsubmit="savePatient(event, ${patientId || 'null'})">
            <div class="form-group">
                <label>Nama *</label>
                <input type="text" id="patient-name" required>
            </div>
            <div class="form-group">
                <label>Umur</label>
                <input type="number" id="patient-age">
            </div>
            <div class="form-group">
                <label>Jenis Kelamin</label>
                <select id="patient-gender">
                    <option value="">Pilih</option>
                    <option value="Male">Laki-laki</option>
                    <option value="Female">Perempuan</option>
                </select>
            </div>
            <div class="form-group">
                <label>Alamat</label>
                <input type="text" id="patient-address">
            </div>
            <div class="form-group">
                <label>Telepon</label>
                <input type="text" id="patient-phone">
            </div>
            <div class="form-group">
                <label>Penyakit</label>
                <input type="text" id="patient-disease">
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    `;
    
    if (patientId) {
        loadPatientData(patientId);
    }
    
    document.getElementById('modal').classList.add('active');
}

async function loadPatientData(id) {
    const query = `
        query GetPatient($id: ID!) {
            patient(id: $id) {
                id
                name
                age
                gender
                address
                phone
                disease
            }
        }
    `;
    const data = await graphqlQuery(query, { id });
    const patient = data.patient;
    
    document.getElementById('patient-name').value = patient.name || '';
    document.getElementById('patient-age').value = patient.age || '';
    document.getElementById('patient-gender').value = patient.gender || '';
    document.getElementById('patient-address').value = patient.address || '';
    document.getElementById('patient-phone').value = patient.phone || '';
    document.getElementById('patient-disease').value = patient.disease || '';
}

async function savePatient(event, patientId) {
    event.preventDefault();
    showLoading();
    
    const name = document.getElementById('patient-name').value;
    const age = parseInt(document.getElementById('patient-age').value) || null;
    const gender = document.getElementById('patient-gender').value || null;
    const address = document.getElementById('patient-address').value || null;
    const phone = document.getElementById('patient-phone').value || null;
    const disease = document.getElementById('patient-disease').value || null;
    
    try {
        if (patientId) {
            const mutation = `
                mutation UpdatePatient($id: ID!, $name: String, $age: Int, $gender: String, $address: String, $phone: String, $disease: String) {
                    updatePatient(
                        id: $id,
                        name: $name,
                        age: $age,
                        gender: $gender,
                        address: $address,
                        phone: $phone,
                        disease: $disease
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                id: patientId,
                name: name || null,
                age: age,
                gender: gender || null,
                address: address || null,
                phone: phone || null,
                disease: disease || null
            });
            showMessage('Pasien berhasil diupdate');
        } else {
            const mutation = `
                mutation CreatePatient($name: String!, $age: Int, $gender: String, $address: String, $phone: String, $disease: String) {
                    createPatient(
                        name: $name,
                        age: $age,
                        gender: $gender,
                        address: $address,
                        phone: $phone,
                        disease: $disease
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                name: name,
                age: age,
                gender: gender || null,
                address: address || null,
                phone: phone || null,
                disease: disease || null
            });
            showMessage('Pasien berhasil ditambahkan');
        }
        closeModal();
        loadPatients();
    } catch (error) {
        console.error('Error saving patient:', error);
    } finally {
        hideLoading();
    }
}

async function editPatient(id) {
    showPatientForm(id);
}

async function deletePatient(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus pasien ini?')) return;
    
    showLoading();
    try {
        const mutation = `mutation DeletePatient($id: ID!) { deletePatient(id: $id) }`;
        await graphqlQuery(mutation, { id });
        showMessage('Pasien berhasil dihapus');
        loadPatients();
    } catch (error) {
        console.error('Error deleting patient:', error);
    } finally {
        hideLoading();
    }
}

// DOCTOR Functions
async function loadDoctors() {
    const query = `
        query {
            doctors {
                id
                name
                specialization
                phone
                email
            }
        }
    `;
    const data = await graphqlQuery(query);
    const listEl = document.getElementById('doctors-list');
    
    if (!data.doctors || data.doctors.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><h3>Belum ada data dokter</h3><p>Klik tombol "Tambah Dokter" untuk menambah data</p></div>';
        return;
    }
    
    listEl.innerHTML = data.doctors.map(doctor => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${doctor.name || 'N/A'}</div>
                <div class="card-actions">
                    <button class="btn btn-warning" onclick="editDoctor(${doctor.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteDoctor(${doctor.id})">Hapus</button>
                </div>
            </div>
            <div class="card-body">
                <div class="field">
                    <span class="field-label">Spesialisasi</span>
                    <span class="field-value">${doctor.specialization || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Telepon</span>
                    <span class="field-value">${doctor.phone || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Email</span>
                    <span class="field-value">${doctor.email || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function showDoctorForm(doctorId = null) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${doctorId ? 'Edit' : 'Tambah'} Dokter</h2>
        <form id="doctor-form" onsubmit="saveDoctor(event, ${doctorId || 'null'})">
            <div class="form-group">
                <label>Nama *</label>
                <input type="text" id="doctor-name" required>
            </div>
            <div class="form-group">
                <label>Spesialisasi</label>
                <input type="text" id="doctor-specialization">
            </div>
            <div class="form-group">
                <label>Telepon</label>
                <input type="text" id="doctor-phone">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="doctor-email">
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    `;
    
    if (doctorId) {
        loadDoctorData(doctorId);
    }
    
    document.getElementById('modal').classList.add('active');
}

async function loadDoctorData(id) {
    const query = `
        query GetDoctor($id: ID!) {
            doctor(id: $id) {
                id
                name
                specialization
                phone
                email
            }
        }
    `;
    const data = await graphqlQuery(query, { id });
    const doctor = data.doctor;
    
    document.getElementById('doctor-name').value = doctor.name || '';
    document.getElementById('doctor-specialization').value = doctor.specialization || '';
    document.getElementById('doctor-phone').value = doctor.phone || '';
    document.getElementById('doctor-email').value = doctor.email || '';
}

async function saveDoctor(event, doctorId) {
    event.preventDefault();
    showLoading();
    
    const name = document.getElementById('doctor-name').value;
    const specialization = document.getElementById('doctor-specialization').value || null;
    const phone = document.getElementById('doctor-phone').value || null;
    const email = document.getElementById('doctor-email').value || null;
    
    try {
        if (doctorId) {
            const mutation = `
                mutation UpdateDoctor($id: ID!, $name: String, $specialization: String, $phone: String, $email: String) {
                    updateDoctor(
                        id: $id,
                        name: $name,
                        specialization: $specialization,
                        phone: $phone,
                        email: $email
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                id: doctorId,
                name: name || null,
                specialization: specialization,
                phone: phone,
                email: email
            });
            showMessage('Dokter berhasil diupdate');
        } else {
            const mutation = `
                mutation CreateDoctor($name: String!, $specialization: String, $phone: String, $email: String) {
                    createDoctor(
                        name: $name,
                        specialization: $specialization,
                        phone: $phone,
                        email: $email
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                name: name,
                specialization: specialization,
                phone: phone,
                email: email
            });
            showMessage('Dokter berhasil ditambahkan');
        }
        closeModal();
        loadDoctors();
    } catch (error) {
        console.error('Error saving doctor:', error);
    } finally {
        hideLoading();
    }
}

async function editDoctor(id) {
    showDoctorForm(id);
}

async function deleteDoctor(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus dokter ini?')) return;
    
    showLoading();
    try {
        const mutation = `mutation DeleteDoctor($id: ID!) { deleteDoctor(id: $id) }`;
        await graphqlQuery(mutation, { id });
        showMessage('Dokter berhasil dihapus');
        loadDoctors();
    } catch (error) {
        console.error('Error deleting doctor:', error);
    } finally {
        hideLoading();
    }
}

// RECORD Functions
async function loadRecords() {
    const query = `
        query {
            records {
                id
                diagnosis
                treatment
                notes
                patient_id
                doctor_id
                patient {
                    id
                    name
                }
                doctor {
                    id
                    name
                }
            }
        }
    `;
    const data = await graphqlQuery(query);
    const listEl = document.getElementById('records-list');
    
    if (!data.records || data.records.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><h3>Belum ada rekam medis</h3><p>Klik tombol "Tambah Rekam Medis" untuk menambah data</p></div>';
        return;
    }
    
    listEl.innerHTML = data.records.map(record => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">Rekam Medis #${record.id}</div>
                <div class="card-actions">
                    <button class="btn btn-warning" onclick="editRecord(${record.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteRecord(${record.id})">Hapus</button>
                </div>
            </div>
            <div class="card-body">
                <div class="field">
                    <span class="field-label">Pasien</span>
                    <span class="field-value">${record.patient ? record.patient.name : 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Dokter</span>
                    <span class="field-value">${record.doctor ? record.doctor.name : 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Diagnosis</span>
                    <span class="field-value">${record.diagnosis || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Pengobatan</span>
                    <span class="field-value">${record.treatment || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Catatan</span>
                    <span class="field-value">${record.notes || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadPatientsAndDoctors() {
    const [patientsData, doctorsData] = await Promise.all([
        graphqlQuery(`query { patients { id name } }`),
        graphqlQuery(`query { doctors { id name } }`)
    ]);
    return {
        patients: patientsData.patients || [],
        doctors: doctorsData.doctors || []
    };
}

function showRecordForm(recordId = null) {
    loadPatientsAndDoctors().then(({patients, doctors}) => {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2>${recordId ? 'Edit' : 'Tambah'} Rekam Medis</h2>
            <form id="record-form" onsubmit="saveRecord(event, ${recordId || 'null'})">
                <div class="form-group">
                    <label>Pasien *</label>
                    <select id="record-patient-id" required>
                        <option value="">Pilih Pasien</option>
                        ${patients.map(p => `<option value="${p.id}">${p.name || `Pasien #${p.id}`}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Dokter *</label>
                    <select id="record-doctor-id" required>
                        <option value="">Pilih Dokter</option>
                        ${doctors.map(d => `<option value="${d.id}">${d.name || `Dokter #${d.id}`}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Diagnosis</label>
                    <input type="text" id="record-diagnosis">
                </div>
                <div class="form-group">
                    <label>Pengobatan</label>
                    <textarea id="record-treatment"></textarea>
                </div>
                <div class="form-group">
                    <label>Catatan</label>
                    <textarea id="record-notes"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" onclick="closeModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        `;
        
        if (recordId) {
            loadRecordData(recordId);
        }
        
        document.getElementById('modal').classList.add('active');
    });
}

async function loadRecordData(id) {
    const query = `
        query GetRecord($id: ID!) {
            record(id: $id) {
                id
                patient_id
                doctor_id
                diagnosis
                treatment
                notes
            }
        }
    `;
    const data = await graphqlQuery(query, { id });
    const record = data.record;
    
    document.getElementById('record-patient-id').value = record.patient_id || '';
    document.getElementById('record-doctor-id').value = record.doctor_id || '';
    document.getElementById('record-diagnosis').value = record.diagnosis || '';
    document.getElementById('record-treatment').value = record.treatment || '';
    document.getElementById('record-notes').value = record.notes || '';
}

async function saveRecord(event, recordId) {
    event.preventDefault();
    showLoading();
    
    const patient_id = document.getElementById('record-patient-id').value;
    const doctor_id = document.getElementById('record-doctor-id').value;
    const diagnosis = document.getElementById('record-diagnosis').value || null;
    const treatment = document.getElementById('record-treatment').value || null;
    const notes = document.getElementById('record-notes').value || null;
    
    try {
        if (recordId) {
            const mutation = `
                mutation UpdateRecord($id: ID!, $patient_id: ID, $doctor_id: ID, $diagnosis: String, $treatment: String, $notes: String) {
                    updateRecord(
                        id: $id,
                        patient_id: $patient_id,
                        doctor_id: $doctor_id,
                        diagnosis: $diagnosis,
                        treatment: $treatment,
                        notes: $notes
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                id: recordId,
                patient_id: patient_id || null,
                doctor_id: doctor_id || null,
                diagnosis: diagnosis,
                treatment: treatment,
                notes: notes
            });
            showMessage('Rekam medis berhasil diupdate');
        } else {
            const mutation = `
                mutation CreateRecord($patient_id: ID!, $doctor_id: ID!, $diagnosis: String, $treatment: String, $notes: String) {
                    createRecord(
                        patient_id: $patient_id,
                        doctor_id: $doctor_id,
                        diagnosis: $diagnosis,
                        treatment: $treatment,
                        notes: $notes
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                patient_id: patient_id,
                doctor_id: doctor_id,
                diagnosis: diagnosis,
                treatment: treatment,
                notes: notes
            });
            showMessage('Rekam medis berhasil ditambahkan');
        }
        closeModal();
        loadRecords();
    } catch (error) {
        console.error('Error saving record:', error);
    } finally {
        hideLoading();
    }
}

async function editRecord(id) {
    showRecordForm(id);
}

async function deleteRecord(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')) return;
    
    showLoading();
    try {
        const mutation = `mutation DeleteRecord($id: ID!) { deleteRecord(id: $id) }`;
        await graphqlQuery(mutation, { id });
        showMessage('Rekam medis berhasil dihapus');
        loadRecords();
    } catch (error) {
        console.error('Error deleting record:', error);
    } finally {
        hideLoading();
    }
}

// APPOINTMENT Functions
async function loadAppointments() {
    const query = `
        query {
            appointments {
                id
                date
                time
                status
                patient_id
                doctor_id
                patient {
                    id
                    name
                }
                doctor {
                    id
                    name
                }
            }
        }
    `;
    const data = await graphqlQuery(query);
    const listEl = document.getElementById('appointments-list');
    
    if (!data.appointments || data.appointments.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><h3>Belum ada janji temu</h3><p>Klik tombol "Buat Janji Temu" untuk menambah data</p></div>';
        return;
    }
    
    listEl.innerHTML = data.appointments.map(appointment => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">Janji Temu #${appointment.id}</div>
                <div class="card-actions">
                    <button class="btn btn-warning" onclick="editAppointment(${appointment.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">Hapus</button>
                </div>
            </div>
            <div class="card-body">
                <div class="field">
                    <span class="field-label">Pasien</span>
                    <span class="field-value">${appointment.patient ? appointment.patient.name : 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Dokter</span>
                    <span class="field-value">${appointment.doctor ? appointment.doctor.name : 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Tanggal</span>
                    <span class="field-value">${appointment.date || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Waktu</span>
                    <span class="field-value">${appointment.time || 'N/A'}</span>
                </div>
                <div class="field">
                    <span class="field-label">Status</span>
                    <span class="field-value">${appointment.status || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function showAppointmentForm(appointmentId = null) {
    loadPatientsAndDoctors().then(({patients, doctors}) => {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2>${appointmentId ? 'Edit' : 'Buat'} Janji Temu</h2>
            <form id="appointment-form" onsubmit="saveAppointment(event, ${appointmentId || 'null'})">
                <div class="form-group">
                    <label>Pasien *</label>
                    <select id="appointment-patient-id" required>
                        <option value="">Pilih Pasien</option>
                        ${patients.map(p => `<option value="${p.id}">${p.name || `Pasien #${p.id}`}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Dokter *</label>
                    <select id="appointment-doctor-id" required>
                        <option value="">Pilih Dokter</option>
                        ${doctors.map(d => `<option value="${d.id}">${d.name || `Dokter #${d.id}`}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tanggal</label>
                    <input type="date" id="appointment-date">
                </div>
                <div class="form-group">
                    <label>Waktu</label>
                    <input type="time" id="appointment-time">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="appointment-status">
                        <option value="Scheduled">Scheduled</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" onclick="closeModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        `;
        
        if (appointmentId) {
            loadAppointmentData(appointmentId);
        }
        
        document.getElementById('modal').classList.add('active');
    });
}

async function loadAppointmentData(id) {
    const query = `
        query GetAppointment($id: ID!) {
            appointment(id: $id) {
                id
                patient_id
                doctor_id
                date
                time
                status
            }
        }
    `;
    const data = await graphqlQuery(query, { id });
    const appointment = data.appointment;
    
    document.getElementById('appointment-patient-id').value = appointment.patient_id || '';
    document.getElementById('appointment-doctor-id').value = appointment.doctor_id || '';
    document.getElementById('appointment-date').value = appointment.date || '';
    document.getElementById('appointment-time').value = appointment.time || '';
    document.getElementById('appointment-status').value = appointment.status || 'Scheduled';
}

async function saveAppointment(event, appointmentId) {
    event.preventDefault();
    showLoading();
    
    const patient_id = document.getElementById('appointment-patient-id').value;
    const doctor_id = document.getElementById('appointment-doctor-id').value;
    const date = document.getElementById('appointment-date').value || null;
    const time = document.getElementById('appointment-time').value || null;
    const status = document.getElementById('appointment-status').value || 'Scheduled';
    
    try {
        if (appointmentId) {
            const mutation = `
                mutation UpdateAppointment($id: ID!, $patient_id: ID, $doctor_id: ID, $date: String, $time: String, $status: String) {
                    updateAppointment(
                        id: $id,
                        patient_id: $patient_id,
                        doctor_id: $doctor_id,
                        date: $date,
                        time: $time,
                        status: $status
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                id: appointmentId,
                patient_id: patient_id || null,
                doctor_id: doctor_id || null,
                date: date,
                time: time,
                status: status
            });
            showMessage('Janji temu berhasil diupdate');
        } else {
            const mutation = `
                mutation CreateAppointment($patient_id: ID!, $doctor_id: ID!, $date: String, $time: String, $status: String) {
                    createAppointment(
                        patient_id: $patient_id,
                        doctor_id: $doctor_id,
                        date: $date,
                        time: $time,
                        status: $status
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation, {
                patient_id: patient_id,
                doctor_id: doctor_id,
                date: date,
                time: time,
                status: status
            });
            showMessage('Janji temu berhasil dibuat');
        }
        closeModal();
        loadAppointments();
    } catch (error) {
        console.error('Error saving appointment:', error);
    } finally {
        hideLoading();
    }
}

async function editAppointment(id) {
    showAppointmentForm(id);
}

async function deleteAppointment(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus janji temu ini?')) return;
    
    showLoading();
    try {
        const mutation = `mutation DeleteAppointment($id: ID!) { deleteAppointment(id: $id) }`;
        await graphqlQuery(mutation, { id });
        showMessage('Janji temu berhasil dihapus');
        loadAppointments();
    } catch (error) {
        console.error('Error deleting appointment:', error);
    } finally {
        hideLoading();
    }
}

// Load initial data
loadData('patients');

