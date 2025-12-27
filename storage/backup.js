// src/storage/backup.js

import { getPessoas, getEventos, savePessoas, saveEventos } from "./storage";

// ===================== EXPORTAR =====================
export function exportBackup() {
  const data = {
    pessoas: getPessoas(),
    eventos: getEventos(),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup-pcd.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ===================== IMPORTAR =====================
export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (!data.pessoas || !data.eventos) {
          throw new Error("Backup inválido");
        }

        savePessoas(data.pessoas);
        saveEventos(data.eventos);

        resolve(true);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsText(file);
  });
}
