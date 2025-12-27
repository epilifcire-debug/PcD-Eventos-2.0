import { Button } from "@/components/ui/button";
import { exportBackup, importBackup } from "@/storage/backup";

export default function BackupManager() {
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm("Importar o backup irá substituir os dados atuais. Continuar?")) {
      return;
    }

    try {
      await importBackup(file);
      alert("Backup importado com sucesso! Recarregue a página.");
    } catch {
      alert("Arquivo de backup inválido.");
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold mb-3 text-gray-700">
        Gerenciamento de Dados
      </h3>

      <div className="flex gap-3">
        <Button onClick={exportBackup}>
          Exportar Backup
        </Button>

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            hidden
            onChange={handleImport}
          />
          <Button variant="outline">
            Importar Backup
          </Button>
        </label>
      </div>
    </div>
  );
}
