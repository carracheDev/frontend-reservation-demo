"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, LogIn, Presentation, Users, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, createReservation, getSalleReservations, getSalles, Reservation, Salle } from "@/lib/api-reservations";

const initialForm = { organisateur: "", dateDebut: "", dateFin: "", nombreParticipants: "" };
const startHour = 8;
const endHour = 20;

function localInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function SalleDetail({ params }: { params: Promise<{ id: string }> }) {
  const [salle, setSalle] = useState<Salle | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [form, setForm] = useState(initialForm);
  const [credentials, setCredentials] = useState({ username: "demo", password: "demo123" });
  const [showLogin, setShowLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const router = useRouter();

  useEffect(() => { params.then(({ id: routeId }) => setId(Number(routeId))); }, [params]);
  useEffect(() => {
    if (id === null) return;
    Promise.all([getSalles(), getSalleReservations(id)]).then(([all, current]) => {
      setSalle(all.find((item) => item.id === id) || null); setReservations(current);
      const first = current.find((item) => item.statut === "CONFIRMEE");
      const date = first ? new Date(first.dateDebut) : new Date();
      setSelectedDay(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
    }).catch((reason: Error) => setNotice({ kind: "error", text: reason.message }));
  }, [id, params]);

  const dayReservations = useMemo(() => reservations.filter((item) => item.statut === "CONFIRMEE" && item.dateDebut.slice(0, 10) === selectedDay), [reservations, selectedDay]);

  function chooseSlot(hour: number) {
    const [year, month, day] = selectedDay.split("-").map(Number);
    const begin = new Date(year, month - 1, day, hour);
    const finish = new Date(year, month - 1, day, hour + 1);
    setForm((current) => ({ ...current, dateDebut: localInput(begin), dateFin: localInput(finish) }));
    setNotice({ kind: "success", text: `Créneau ${String(hour).padStart(2, "0")}:00 sélectionné.` });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice(null);
    try {
      if (!showLogin) { setShowLogin(true); setBusy(false); return; }
      await createReservation({ salleId: Number(id), organisateur: form.organisateur, dateDebut: form.dateDebut, dateFin: form.dateFin, ...(form.nombreParticipants ? { nombreParticipants: Number(form.nombreParticipants) } : {}) }, credentials.username, credentials.password);
      router.push("/reservations");
    } catch (reason) {
      const error = reason as ApiError;
      setNotice({ kind: "error", text: error.status === 401 ? "Identifiants incorrects. Vérifiez votre accès de démonstration." : error.status === 409 ? `${error.message} Les créneaux pris sont visibles dans le planning.` : error.message });
    } finally { setBusy(false); }
  }

  if (!salle) return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10"><Link href="/" className="text-sm text-amber-600">Retour au dashboard</Link><div className="mt-12 h-48 animate-pulse rounded-lg bg-slate-200" /></main>;
  const dayLabel = selectedDay ? new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${selectedDay}T12:00:00`)) : "Planning";
  return <main className="min-h-screen overflow-x-hidden bg-slate-50">{notice?.kind === "success" && <div className="toast fixed inset-x-4 top-4 z-20 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg sm:left-auto sm:right-5 sm:w-auto"><CheckCircle2 size={18} /> {notice.text}</div>}<nav className="bg-slate-900 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-5 lg:px-8"><Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950"><CalendarDays size={19} /></span>RoomBook</Link><Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-300 transition hover:text-white sm:text-sm"><ArrowLeft size={16} /> Dashboard</Link></div></nav>
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-5 sm:pb-16 sm:pt-10 lg:px-8"><div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:pb-8 md:flex-row md:items-end"><div><div className="flex flex-wrap items-center gap-3"><span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">{salle.type}</span><span className="flex items-center gap-1.5 text-sm text-slate-500">{salle.type === "CONFERENCE" ? <Presentation size={15} /> : <Users size={15} />} {salle.capacite} places</span></div><h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">{salle.nom}</h1><p className="mt-2 text-sm text-slate-500 sm:text-base">Planning et réservation de la salle.</p></div><label className="block text-sm font-medium text-slate-600">Jour du planning<input type="date" value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)} className="field mt-2 w-full sm:w-auto" /></label></div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]"><div><div className="flex items-end justify-between"><div><h2 className="text-xl font-bold tracking-tight text-slate-900">{dayLabel}</h2><p className="mt-1 text-sm text-slate-500">Cliquez sur une plage libre pour la sélectionner.</p></div><Clock3 size={21} className="text-amber-500" /></div><div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="min-w-[720px]"><div className="ml-20 grid grid-cols-12 text-xs font-medium text-slate-400">{Array.from({ length: 12 }, (_, index) => <span key={index}>{String(startHour + index).padStart(2, "0")}h</span>)}</div><div className="relative mt-3 h-28 border-y border-slate-200 bg-slate-50">{Array.from({ length: 12 }, (_, index) => <button key={index} type="button" onClick={() => chooseSlot(startHour + index)} className="absolute inset-y-0 border-r border-slate-200 transition hover:bg-amber-50" style={{ left: `${index * (100 / 12)}%`, width: `${100 / 12}%` }} aria-label={`Sélectionner ${startHour + index} heures`} />)}{dayReservations.map((reservation) => { const begin = new Date(reservation.dateDebut); const finish = new Date(reservation.dateFin); const left = Math.max(0, ((begin.getHours() + begin.getMinutes() / 60) - startHour) / (endHour - startHour) * 100); const width = Math.min(100 - left, (finish.getTime() - begin.getTime()) / 3600000 / (endHour - startHour) * 100); return <div key={reservation.id} className="absolute inset-y-3 z-10 overflow-hidden rounded-md border border-amber-500 bg-amber-400 px-3 py-2 text-xs font-semibold text-amber-950 shadow-sm" style={{ left: `${left}%`, width: `${width}%` }}><span className="block truncate">{reservation.organisateur}</span><span className="block truncate font-normal">{begin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – {finish.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></div>; })}</div><div className="mt-3 flex items-center gap-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-slate-100 ring-1 ring-slate-300" /> Libre</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Réservé</span></div></div></div>{dayReservations.length === 0 && <div className="mt-5 flex items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white p-6"><div className="rounded-lg bg-amber-100 p-3 text-amber-700"><CalendarDays size={22} /></div><div><p className="font-semibold text-slate-900">Aucune réservation prévue aujourd&apos;hui</p><p className="mt-1 text-sm text-slate-500">La journée est entièrement disponible.</p></div></div>}</div>
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold tracking-tight text-slate-900">Réserver cette salle</h2><p className="mt-1 text-sm text-slate-500">Les champs marqués sont nécessaires.</p>{notice && <div className={`mt-5 flex gap-2 border px-3 py-3 text-sm ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{notice.kind === "success" ? <CheckCircle2 size={17} /> : <X size={17} />}{notice.text}</div>}<form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium text-slate-700">Organisateur<input required value={form.organisateur} onChange={(e) => setForm({ ...form, organisateur: e.target.value })} className="field" placeholder="Nom ou équipe" /></label><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Début<input required type="datetime-local" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} className="field" /></label><label className="block text-sm font-medium text-slate-700">Fin<input required type="datetime-local" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} className="field" /></label></div><label className="block text-sm font-medium text-slate-700">Participants <span className="font-normal text-slate-400">(optionnel)</span><input type="number" min="1" max={salle.capacite} value={form.nombreParticipants} onChange={(e) => setForm({ ...form, nombreParticipants: e.target.value })} className="field" placeholder={`Maximum ${salle.capacite}`} /></label>{showLogin && <div className="border-t border-slate-200 pt-4"><div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800"><LogIn size={16} className="text-amber-600" /> Accès sécurisé</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><label className="block text-sm text-slate-600">Utilisateur<input required value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} className="field" /></label><label className="block text-sm text-slate-600">Mot de passe<input required type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className="field" /></label></div></div>}<button disabled={busy} className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-wait disabled:opacity-60">{busy ? "Enregistrement…" : showLogin ? "Confirmer la réservation" : "Continuer vers la réservation"}</button></form></aside></div></section></main>;
}