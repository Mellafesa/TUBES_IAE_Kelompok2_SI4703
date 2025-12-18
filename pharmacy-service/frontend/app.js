const API_URL = '/graphql';
const ADMIN_SERVICE_URL = 'http://localhost:4003/graphql';

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

// Fetch patients from admin service
async function fetchPatients() {
    try {
        console.log('Fetching patients from:', ADMIN_SERVICE_URL);
        
        const response = await fetch(ADMIN_SERVICE_URL, {
            method: 'POST',
            mode: 'cors', // Explicitly enable CORS
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: `query { patients { id name age phone } }`
            })
        });

        console.log('Response status:', response.status, response.statusText);

        // Check if response is ok
        if (!response.ok) {
            const text = await response.text();
            console.error('HTTP error fetching patients:', response.status, text);
            showMessage(`Error ${response.status}: Tidak dapat terhubung ke admin service. Pastikan admin service berjalan di http://localhost:4003`, 'error');
            return [];
        }

        // Check if response has content
        const text = await response.text();
        console.log('Response text length:', text.length);
        
        if (!text || text.trim() === '') {
            console.error('Empty response from admin service');
            showMessage('Admin service mengembalikan response kosong', 'error');
            return [];
        }

        // Parse JSON
        let data;
        try {
            data = JSON.parse(text);
            console.log('Parsed data:', data);
        } catch (parseError) {
            console.error('Invalid JSON response from admin service:', parseError);
            console.error('Response text:', text.substring(0, 200));
            showMessage('Format response dari admin service tidak valid', 'error');
            return [];
        }

        if (data.errors) {
            console.error('GraphQL errors fetching patients:', data.errors);
            showMessage(`Error GraphQL: ${data.errors[0].message}`, 'error');
            return [];
        }
        
        const patients = data.data?.patients || [];
        console.log('Fetched patients:', patients.length);
        return patients;
    } catch (error) {
        console.error('Failed to fetch patients:', error);
        console.error('Error details:', error.message, error.stack);
        
        // Check if it's a network error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showMessage('Tidak dapat terhubung ke admin service. Pastikan admin service berjalan di http://localhost:4003 dan CORS sudah diaktifkan.', 'error');
        } else {
            showMessage(`Error: ${error.message}`, 'error');
        }
        return [];
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

function getStatusClass(status) {
    const statusMap = {
        'Pending': 'status-pending',
        'Dispensed': 'status-dispensed',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}

// Load Medicines
async function loadMedicines() {
    showLoading();
    try {
        const query = `
            query {
                medicines {
                    id
                    name
                    dosage
                    instructions
                    status
                    notes
                    patient_id
                    patient {
                        id
                        name
                        age
                        phone
                    }
                }
            }
        `;
        const data = await graphqlQuery(query);
        const listEl = document.getElementById('medicines-list');
        
        if (!data.medicines || data.medicines.length === 0) {
            listEl.innerHTML = '<div class="empty-state"><h3>Belum ada data obat</h3><p>Klik tombol "Tambah Obat" untuk menambah data</p></div>';
            return;
        }
        
        listEl.innerHTML = data.medicines.map(medicine => `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">${medicine.name || 'N/A'}</div>
                    <div class="card-actions">
                        <button class="btn btn-warning" onclick="editMedicine(${medicine.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteMedicine(${medicine.id})">Hapus</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="field">
                        <span class="field-label">Pasien</span>
                        <span class="field-value">${medicine.patient ? `${medicine.patient.name} (ID: ${medicine.patient.id})` : `ID: ${medicine.patient_id}`}</span>
                    </div>
                    <div class="field">
                        <span class="field-label">Dosis</span>
                        <span class="field-value">${medicine.dosage || 'N/A'}</span>
                    </div>
                    <div class="field">
                        <span class="field-label">Status</span>
                        <span class="field-value">
                            <span class="status-badge ${getStatusClass(medicine.status)}">${medicine.status || 'Pending'}</span>
                        </span>
                    </div>
                    <div class="field">
                        <span class="field-label">Cara Pakai</span>
                        <span class="field-value">${medicine.instructions || 'N/A'}</span>
                    </div>
                    <div class="field">
                        <span class="field-label">Catatan</span>
                        <span class="field-value">${medicine.notes || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading medicines:', error);
    } finally {
        hideLoading();
    }
}

// Show Medicine Form
async function showMedicineForm(medicineId = null) {
    const patients = await fetchPatients();
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${medicineId ? 'Edit' : 'Tambah'} Obat</h2>
        <form id="medicine-form" onsubmit="saveMedicine(event, ${medicineId || 'null'})">
            <div class="form-group">
                <label>Pasien *</label>
                <select id="medicine-patient-id" required>
                    <option value="">Pilih Pasien</option>
                    ${patients.map(p => `<option value="${p.id}">${p.name || `Pasien #${p.id}`} ${p.age ? `(${p.age} tahun)` : ''} ${p.phone ? `- ${p.phone}` : ''}</option>`).join('')}
                </select>
                ${patients.length === 0 ? '<small style="color: #e74c3c;">Tidak ada pasien. Pastikan admin service berjalan dan sudah ada data pasien.</small>' : ''}
            </div>
            <div class="form-group">
                <label>Nama Obat *</label>
                <input type="text" id="medicine-name" required>
            </div>
            <div class="form-group">
                <label>Dosis</label>
                <input type="text" id="medicine-dosage" placeholder="Contoh: 500mg, 10ml">
            </div>
            <div class="form-group">
                <label>Cara Pakai</label>
                <textarea id="medicine-instructions" placeholder="Contoh: Minum 2 tablet setiap 6 jam setelah makan"></textarea>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="medicine-status">
                    <option value="Pending">Pending</option>
                    <option value="Dispensed">Dispensed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label>Catatan</label>
                <textarea id="medicine-notes" placeholder="Catatan tambahan"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
        </form>
    `;
    
    if (medicineId) {
        await loadMedicineData(medicineId);
    }
    
    document.getElementById('modal').classList.add('active');
}

// Load Medicine Data
async function loadMedicineData(id) {
    const query = `
        query {
            medicine(id: "${id}") {
                id
                patient_id
                name
                dosage
                instructions
                status
                notes
            }
        }
    `;
    const data = await graphqlQuery(query);
    const medicine = data.medicine;
    
    document.getElementById('medicine-patient-id').value = medicine.patient_id || '';
    document.getElementById('medicine-name').value = medicine.name || '';
    document.getElementById('medicine-dosage').value = medicine.dosage || '';
    document.getElementById('medicine-instructions').value = medicine.instructions || '';
    document.getElementById('medicine-status').value = medicine.status || 'Pending';
    document.getElementById('medicine-notes').value = medicine.notes || '';
}

// Save Medicine
async function saveMedicine(event, medicineId) {
    event.preventDefault();
    showLoading();
    
    const patient_id = document.getElementById('medicine-patient-id').value;
    const name = document.getElementById('medicine-name').value;
    const dosage = document.getElementById('medicine-dosage').value || null;
    const instructions = document.getElementById('medicine-instructions').value || null;
    const status = document.getElementById('medicine-status').value || 'Pending';
    const notes = document.getElementById('medicine-notes').value || null;
    
    try {
        if (medicineId) {
            const mutation = `
                mutation {
                    updateMedicine(
                        id: "${medicineId}",
                        patient_id: "${patient_id}",
                        name: "${name.replace(/"/g, '\\"')}",
                        ${dosage ? `dosage: "${dosage.replace(/"/g, '\\"')}",` : ''}
                        ${instructions ? `instructions: "${instructions.replace(/"/g, '\\"')}",` : ''}
                        status: "${status}",
                        ${notes ? `notes: "${notes.replace(/"/g, '\\"')}"` : ''}
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation);
            showMessage('Obat berhasil diupdate');
        } else {
            const mutation = `
                mutation {
                    createMedicine(
                        patient_id: "${patient_id}",
                        name: "${name.replace(/"/g, '\\"')}",
                        ${dosage ? `dosage: "${dosage.replace(/"/g, '\\"')}",` : ''}
                        ${instructions ? `instructions: "${instructions.replace(/"/g, '\\"')}",` : ''}
                        ${status !== 'Pending' ? `status: "${status}",` : ''}
                        ${notes ? `notes: "${notes.replace(/"/g, '\\"')}"` : ''}
                    ) {
                        id
                    }
                }
            `;
            await graphqlQuery(mutation);
            showMessage('Obat berhasil ditambahkan');
        }
        closeModal();
        loadMedicines();
    } catch (error) {
        console.error('Error saving medicine:', error);
    } finally {
        hideLoading();
    }
}

// Edit Medicine
async function editMedicine(id) {
    await showMedicineForm(id);
}

// Delete Medicine
async function deleteMedicine(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus obat ini?')) return;
    
    showLoading();
    try {
        const mutation = `mutation { deleteMedicine(id: "${id}") }`;
        await graphqlQuery(mutation);
        showMessage('Obat berhasil dihapus');
        loadMedicines();
    } catch (error) {
        console.error('Error deleting medicine:', error);
    } finally {
        hideLoading();
    }
}

// Load initial data
loadMedicines();

