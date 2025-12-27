// src/storage/storage.js

const STORAGE_KEYS = {
  pessoas: "pcd_pessoas",
  eventos: "pcd_eventos"
};

// ===================== PESSOAS =====================
export function getPessoas() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.pessoas)) || [];
}

export function savePessoas(pessoas) {
  localStorage.setItem(STORAGE_KEYS.pessoas, JSON.stringify(pessoas));
}

// ===================== EVENTOS =====================
export function getEventos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.eventos)) || [];
}

export function saveEventos(eventos) {
  localStorage.setItem(STORAGE_KEYS.eventos, JSON.stringify(eventos));
}