document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah pengguna sudah login
    if (window.location.pathname.endsWith('index.html') && !localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Logika Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Kredensial hardcoded
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'index.html';
            } else {
                alert('Username atau password salah.');
            }
        });
        return;
    }

    // Logika Dashboard (hanya berjalan jika sudah login)
    const fileForm = document.getElementById('file-form');
    const fileTableBody = document.querySelector('#file-table tbody');
    const berkasChecklistDiv = document.getElementById('berkas-checklist');
    const kategoriSelect = document.getElementById('kategori');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Tombol Filter
    const filterDailyBtn = document.getElementById('filter-daily-btn');
    const filterWeeklyBtn = document.getElementById('filter-weekly-btn');
    const filterMonthlyBtn = document.getElementById('filter-monthly-btn');
    const filterAllBtn = document.getElementById('filter-all-btn');

    const berkasLists = {
        'Amanah': [
            "bukti tanda terima dokumen pencairan (akad)",
            "akta jaminan fidusia",
            "fc bpkb",
            "ktp suami,istri,kk",
            "bon faktur",
            "kuintansi stok"
        ],
        'Arrum BPKB': [
            "1.bukti tanda terima dokumen pencairan (akad)",
            "2.akta jaminan fidusia",
            "3.fc bpkb",
            "4.ktp suami,istri,kk",
            "5.bon faktur",
            "6.kuintansi stok"
        ]
    };

    let files = JSON.parse(localStorage.getItem('files')) || [];

    // Tampilkan data harian saat halaman dimuat
    renderFiles(filterFilesByDate('daily'));

    function renderRequiredFilesChecklist(requiredFiles) {
        berkasChecklistDiv.innerHTML = '';
        if (requiredFiles) {
            requiredFiles.forEach((berkas, index) => {
                const checkboxContainer = document.createElement('div');
                checkboxContainer.classList.add('checkbox-item');
                
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = `berkas-${index}`;
                input.value = berkas;

                const label = document.createElement('label');
                label.htmlFor = `berkas-${index}`;
                label.textContent = berkas;

                checkboxContainer.appendChild(input);
                checkboxContainer.appendChild(label);
                berkasChecklistDiv.appendChild(checkboxContainer);
            });
        }
    }
    
    kategoriSelect.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        const requiredFiles = berkasLists[selectedCategory];
        renderRequiredFilesChecklist(requiredFiles);
    });

    fileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nama = document.getElementById('nama').value;
        const kategori = kategoriSelect.value;
        const cabang = document.getElementById('cabang').value;
        const waktu = document.getElementById('waktu').value;
        
        const checkboxes = document.querySelectorAll('#berkas-checklist input[type="checkbox"]');
        const completedFiles = [];
        const incompleteFiles = [];

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                completedFiles.push(checkbox.value);
            } else {
                incompleteFiles.push(checkbox.value);
            }
        });

        const newFile = {
            nama,
            kategori,
            cabang,
            waktu,
            kelengkapan: completedFiles.join(', '),
            tidakLengkap: incompleteFiles.join(', '),
            status: incompleteFiles.length === 0 ? "Lengkap" : "Belum Lengkap",
        };

        files.push(newFile);
        saveFiles();
        renderFiles(filterFilesByDate('daily'));
        fileForm.reset();
        renderRequiredFilesChecklist(null);
    });

    fileTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            files.splice(index, 1);
            saveFiles();
            renderFiles(files);
        }
    });

    // Fungsi untuk memfilter data berdasarkan rentang waktu
    function filterFilesByDate(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'weekly':
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Senin sebagai hari pertama
                startDate = new Date(now.setDate(diff));
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'all':
            default:
                return files;
        }

        return files.filter(file => new Date(file.waktu) >= startDate);
    }

    // Event listener untuk tombol filter
    filterDailyBtn.addEventListener('click', () => {
        setActiveFilterButton(filterDailyBtn);
        renderFiles(filterFilesByDate('daily'));
    });
    filterWeeklyBtn.addEventListener('click', () => {
        setActiveFilterButton(filterWeeklyBtn);
        renderFiles(filterFilesByDate('weekly'));
    });
    filterMonthlyBtn.addEventListener('click', () => {
        setActiveFilterButton(filterMonthlyBtn);
        renderFiles(filterFilesByDate('monthly'));
    });
    filterAllBtn.addEventListener('click', () => {
        setActiveFilterButton(filterAllBtn);
        renderFiles(filterFilesByDate('all'));
    });

    function setActiveFilterButton(activeButton) {
        document.querySelectorAll('.filter-buttons button').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    function renderFiles(filteredFiles) {
        fileTableBody.innerHTML = '';
        if (filteredFiles && filteredFiles.length > 0) {
            filteredFiles.forEach((file, index) => {
                const formattedTime = file.waktu ? new Date(file.waktu).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${file.nama}</td>
                    <td>${file.kategori || '-'}</td>
                    <td>${file.cabang || '-'}</td>
                    <td>${formattedTime}</td>
                    <td>${file.kelengkapan || '-'}</td>
                    <td>${file.tidakLengkap || '-'}</td>
                    <td style="color: ${file.status === 'Lengkap' ? 'green' : 'red'}; font-weight: bold;">${file.status}</td>
                    <td><button class="delete-btn" data-index="${index}">Hapus</button></td>
                `;
                fileTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="9" style="text-align:center;">Tidak ada data pada periode ini.</td>`;
            fileTableBody.appendChild(row);
        }
    }

    function saveFiles() {
        localStorage.setItem('files', JSON.stringify(files));
    }

    exportExcelBtn.addEventListener('click', () => {
        const table = document.getElementById('file-table');
        const wb = XLSX.utils.table_to_book(table, { sheet: "SheetJS" });
        XLSX.writeFile(wb, "Data_Berkas.xlsx");
    });

    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        const table = document.getElementById('file-table');
        
        html2canvas(table).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = doc.internal.pageSize.getWidth() - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            doc.text("Daftar Berkas", 40, 30);
            doc.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
            doc.save("Data_Berkas.pdf");
        });
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });
});
