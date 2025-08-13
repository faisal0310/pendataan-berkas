document.addEventListener("DOMContentLoaded", () => {
  const fileForm = document.getElementById("file-form");
  const fileTableBody = document.querySelector("#file-table tbody");
  const berkasChecklistDiv = document.getElementById("berkas-checklist");
  const exportExcelBtn = document.getElementById("export-excel-btn");
  const exportPdfBtn = document.getElementById("export-pdf-btn");

  const requiredFiles = [
    "bukti tanda terima dokumen pencairan (akad)",
    "akta jaminan fidusia",
    "fc bpkb",
    "ktp suami,istri,kk",
    "bon faktur",
    "kuintansi stok",
  ];

  let files = JSON.parse(localStorage.getItem("files")) || [];
  renderRequiredFilesChecklist();
  renderFiles();

  function renderRequiredFilesChecklist() {
    berkasChecklistDiv.innerHTML = "";
    requiredFiles.forEach((berkas, index) => {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.classList.add("checkbox-item");

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `berkas-${index}`;
      input.value = berkas;

      const label = document.createElement("label");
      label.htmlFor = `berkas-${index}`;
      label.textContent = berkas;

      checkboxContainer.appendChild(input);
      checkboxContainer.appendChild(label);
      berkasChecklistDiv.appendChild(checkboxContainer);
    });
  }

  fileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value;
    const cabang = document.getElementById("cabang").value;
    const waktu = document.getElementById("waktu").value;
    const checkboxes = document.querySelectorAll(
      '#berkas-checklist input[type="checkbox"]'
    );

    const completedFiles = [];
    const incompleteFiles = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        completedFiles.push(checkbox.value);
      } else {
        incompleteFiles.push(checkbox.value);
      }
    });

    const newFile = {
      nama,
      cabang,
      waktu,
      kelengkapan: completedFiles.join(", "),
      tidakLengkap: incompleteFiles.join(", "),
      status: incompleteFiles.length === 0 ? "Lengkap" : "Belum Lengkap",
    };

    files.push(newFile);
    saveFiles();
    renderFiles();
    fileForm.reset();
    renderRequiredFilesChecklist();
  });

  fileTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.getAttribute("data-index");
      files.splice(index, 1);
      saveFiles();
      renderFiles();
    }
  });

  function renderFiles() {
    fileTableBody.innerHTML = "";
    files.forEach((file, index) => {
      const formattedTime = file.waktu
        ? new Date(file.waktu).toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "-";

      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${file.nama}</td>
                <td>${file.cabang || "-"}</td>
                <td>${formattedTime}</td>
                <td>${file.kelengkapan || "-"}</td>
                <td>${file.tidakLengkap || "-"}</td>
                <td style="color: ${
                  file.status === "Lengkap" ? "green" : "red"
                }; font-weight: bold;">${file.status}</td>
                <td><button class="delete-btn" data-index="${index}">Hapus</button></td>
            `;
      fileTableBody.appendChild(row);
    });
  }

  function saveFiles() {
    localStorage.setItem("files", JSON.stringify(files));
  }

  // FUNGSI UNTUK EKSPOR KE EXCEL
  exportExcelBtn.addEventListener("click", () => {
    const table = document.getElementById("file-table");
    const wb = XLSX.utils.table_to_book(table, { sheet: "SheetJS" });
    XLSX.writeFile(wb, "Data_Berkas.xlsx");
  });

  // FUNGSI UNTUK EKSPOR KE PDF
  exportPdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt", "a4");
    const table = document.getElementById("file-table");

    // Menggunakan html2canvas untuk mengubah tabel menjadi gambar
    html2canvas(table).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = doc.internal.pageSize.getWidth() - 40; // Kurangi padding
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.text("Daftar Berkas", 40, 30);
      doc.addImage(imgData, "PNG", 20, 50, imgWidth, imgHeight);
      doc.save("Data_Berkas.pdf");
    });
  });
});
