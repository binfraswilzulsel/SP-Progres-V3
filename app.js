const container = document.getElementById('main-container');

// --- UTILITY FUNCTIONS ---
function formatRupiah(angka) {
    if (!angka) return '0';
    const numberString = String(angka).replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        const separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return 'Rp ' + rupiah;
}

function getStatusClass(pelaksanaan) {
    switch (pelaksanaan.toLowerCase()) {
        case 'belum terlaksana':
            return 'status-belum';
        case 'on progres':
            return 'status-onprogres';
        case 'berproses':
            return 'status-berproses';
        case 'selesai':
            return 'status-selesai';
        default:
            return '';
    }
}
// ------------------------------------------

// FUNGSI UTAMA: MENGAMBIL DAN MERENDER DATA DARI JSON
async function fetchAndRenderData() {
    try {
        // Menggunakan Fetch API untuk mengambil data dari file JSON
        const response = await fetch('data_progres.json'); 
        
        if (!response.ok) {
            throw new Error(`Gagal memuat data: ${response.statusText}`);
        }

        const dataProgres = await response.json();

        // Hapus konten lama (jika ada)
        container.innerHTML = ''; 

        // Render data yang baru
        dataProgres.forEach(opd => {
            const opdCard = document.createElement('div');
            opdCard.className = 'opd-card';
            opdCard.setAttribute('data-opd', opd.opd);
            
            const totalKegiatan = opd.kegiatan.length;
            const formattedPagu = formatRupiah(opd.pagu_total);

            opdCard.innerHTML = `
                <div class="opd-header">
                    <div class="opd-info">
                        <div class="opd-emoji">${opd.emoji}</div>
                        <div class="opd-text">
                            <div class="opd-title">${opd.opd}</div>
                            <div class="opd-detail-info">
                                Total Anggaran: <span>${formattedPagu}</span><br>
                                Jumlah Kegiatan: <span>${totalKegiatan}</span>
                            </div>
                        </div>
                    </div>
                    <span class="material-icons toggle-icon">expand_more</span>
                </div>
                <div class="kegiatan-container" id="kegiatan-${opd.opd.replace(/\s/g, '-')}-container">
                        </div>
            `;
            container.appendChild(opdCard);

            // Setup Event Listener untuk Toggle OPD
            opdCard.addEventListener('click', (e) => {
                if (e.target.closest('.kegiatan-container')) {
                    return; 
                }
                if (e.target.tagName !== 'A' && e.target.parentElement.tagName !== 'A') {
                    toggleOPD(opdCard);
                }
            });

            const kegiatanContainer = opdCard.querySelector('.kegiatan-container');
            renderKegiatan(kegiatanContainer, opd.kegiatan);
        });

    } catch (error) {
        console.error("Gagal mengambil atau merender data:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat data. Cek file data_progres.json atau koneksi Live Server Anda.</p>`;
    }
}


// Fungsi Toggle OPD (TIDAK BERUBAH)
function toggleOPD(cardElement) {
    const container = cardElement.querySelector('.kegiatan-container');
    
    if (container.style.display === 'block') {
        container.style.display = 'none';
        cardElement.classList.remove('expanded');
    } else {
        container.style.display = 'block';
        cardElement.classList.add('expanded');
    }
}

// Fungsi Render Kegiatan (TIDAK BERUBAH)
function renderKegiatan(containerElement, kegiatanData) {
    kegiatanData.forEach(kegiatan => {
        const kegiatanCard = document.createElement('div');
        kegiatanCard.className = 'kegiatan-card';
        
        const formattedPagu = formatRupiah(kegiatan.pagu);
        const statusClass = getStatusClass(kegiatan.pelaksanaan); 

        kegiatanCard.innerHTML = `
            <div class="kegiatan-header">
                <div class="kegiatan-title">${kegiatan.no}. ${kegiatan.nama}</div>
                <span class="material-icons toggle-icon">expand_more</span>
            </div>
            <div class="kegiatan-detail">
                <p>Anggaran: <span>${formattedPagu}</span></p>
                
                <div class="status-container">
                    Pelaksanaan : &nbsp; 
                    <div class="status-dot ${statusClass}"></div>
                    <strong>${kegiatan.pelaksanaan}</strong>
                </div>

                <p>Bobot: <span>${kegiatan.bobot}%</span></p>

                <p>Progres Realisasi Keuangan: <span>${kegiatan.realisasi_keuangan}%</span></p>
                <div class="progress-bar-container progress-keuangan">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${kegiatan.realisasi_keuangan}%;"></div>
                    </div>
                </div>

                <p>Progres Realisasi Fisik: <span>${kegiatan.realisasi_fisik}%</span></p>
                <div class="progress-bar-container progress-fisik">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${kegiatan.realisasi_fisik}%;"></div>
                    </div>
                </div>
                
                <p><strong>Keterangan:</strong> ${kegiatan.keterangan || '-'}</p>
                <p><strong>Rencana Aksi:</strong> ${kegiatan.rencana_aksi || '-'}</p>
                
                <a href="${kegiatan.link_pdf}" class="pdf-button" target="_blank">LIHAT LAPORAN PDF</a>
            </div>
        `;
        containerElement.appendChild(kegiatanCard);
        
        const headerElement = kegiatanCard.querySelector('.kegiatan-header');
        const detailElement = kegiatanCard.querySelector('.kegiatan-detail');

        headerElement.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            kegiatanCard.classList.toggle('expanded');
            
            if (kegiatanCard.classList.contains('expanded')) {
                detailElement.style.display = 'block'; 
            } else {
                detailElement.style.display = 'none';  
            }
        });

        kegiatanCard.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.parentElement.tagName === 'A') {
                e.stopPropagation();
            } else if (e.target.closest('.kegiatan-header')) {
                return;
            } else {
                e.stopPropagation();
            }
        });
    });
}

// Panggil fungsi untuk memulai rendering saat app.js dimuat
fetchAndRenderData();