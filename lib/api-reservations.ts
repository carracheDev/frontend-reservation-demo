import { apiUrl } from "./api-config";

export type Salle = {
  id: number;
  nom: string;
  capacite: number;
  type: "REUNION" | "CONFERENCE";
  localisation?: string;
  equipements?: string[];
};

export type Reservation = {
  id: number;
  salleId: number;
  salleNom: string;
  organisateur: string;
  dateDebut: string;
  dateFin: string;
  nombreParticipants: number | null;
  statut: "CONFIRMEE" | "ANNULEE";
  description?: string;
};

export type ReservationInput = {
  salleId: number;
  organisateur: string;
  dateDebut: string;
  dateFin: string;
  nombreParticipants?: number;
  description?: string;
};

export type DashboardStats = {
  nombreTotalSalles: number;
  nombreReservationsAujourdhui: number;
  nombreReservationsAVenir: number;
  tauxOccupationJour: number;
  salleLaPlusReservee: string | null;
};

export class ApiError extends Error {
  status: number;
  payload: { message?: string };

  constructor(status: number, payload: { message?: string }) {
    super(payload.message || `La requête a échoué (${status}).`);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...options, cache: "no-store" });
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifiez que Spring Boot est démarré.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T;
}

export const getSalles = () => request<Salle[]>("/api/salles");
export const getSalleReservations = (id: number) =>
  request<Reservation[]>(`/api/salles/${id}/reservations`);
export const getReservations = () => request<Reservation[]>("/api/reservations");
export const getDashboardStats = () => request<DashboardStats>("/api/stats/dashboard");

function normalizeDate(value: string) {
  const normalized = value.trim().replace(" ", "T");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(normalized)) {
    throw new Error("Date invalide. Utilisez le format AAAA-MM-JJ HH:MM.");
  }
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

export const createReservation = (input: ReservationInput, username: string, password: string) =>
  request<Reservation>("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
    body: JSON.stringify({
      ...input,
      salleId: Number(input.salleId),
      dateDebut: normalizeDate(input.dateDebut),
      dateFin: normalizeDate(input.dateFin),
    }),
  });

export const cancelReservation = (id: number, username: string, password: string) =>
  request<Reservation>(`/api/reservations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
  });