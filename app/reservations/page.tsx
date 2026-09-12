"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getReservations, Reservation } from "@/lib/api-reservations";

function date(value: string) { return new Date(value); }
function dateLabel(value: string) { return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date(value)); }
function timeLabel(value: string) { return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date(value)); }

function BookingRow({ booking }: { booking: Reservation }) {
  return <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{booking.salleNom}</p><p className="mt-1 text-sm text-slate-500">{booking.organisateur}{booking.description ? ` · ${booking.description}` : ""}</p></div><div className="flex items-center gap-5 text-sm text-slate-600"><span className="flex items-center gap-2"><Clock3 size={16} className="text-amber-500" />{timeLabel(booking.dateDebut)} – {timeLabel(booking.dateFin)}</span><span className="flex items-center gap-1.5"><Users size={16} />{booking.nombreParticipants ?? "—"}</span></div></div>;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getReservations().then(setReservations).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, []);
  const today = new Date().toDateString();
  const active = reservations.filter((item) => item.statut === "CONFIRMEE");
  const todayBookings = active.filter((item) => date(item.dateDebut).toDateString() === today).sort((a, b) => date(a.dateDebut).getTime() - date(b.dateDebut).getTime());
  const upcoming = active.filter((item) => date(item.dateDebut).toDateString() !== today && date(item.dateDebut) > new Date()).sort((a, b) => date(a.dateDebut).getTime() - date(b.dateDebut).getTime());
  return <main className="min-h-screen bg-slate-50"><nav className="bg-slate-900 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950"><CalendarDays size={19} /></span>RoomBook</Link><Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={16} /> Dashboard</Link></div></nav><section className="mx-auto max-w-7xl px-5 pb-16 pt-12 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Planning partagé</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-900">Toutes les réservations</h1><p className="mt-3 text-slate-500">Les créneaux confirmés de toutes les salles, regroupés par horizon.</p>{error && <div className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{loading ? <div className="mt-10 h-48 animate-pulse rounded-lg bg-slate-200" /> : <div className="mt-10 grid gap-10 lg:grid-cols-2"><section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">Aujourd&apos;hui</h2><p className="mt-1 text-sm text-slate-500">{todayBookings.length} réservation{todayBookings.length > 1 ? "s" : ""}</p></div><CalendarDays className="text-amber-500" size={20} /></div><div className="space-y-3">{todayBookings.length ? todayBookings.map((booking) => <BookingRow key={booking.id} booking={booking} />) : <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">Aucune réservation aujourd&apos;hui.</p>}</div></section><section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">À venir</h2><p className="mt-1 text-sm text-slate-500">{upcoming.length} réservation{upcoming.length > 1 ? "s" : ""}</p></div><CalendarDays className="text-amber-500" size={20} /></div><div className="space-y-3">{upcoming.length ? upcoming.map((booking) => <div key={booking.id}><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{dateLabel(booking.dateDebut)}</p><BookingRow booking={booking} /></div>) : <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">Aucune réservation à venir.</p>}</div></section></div>}</section></main>;
}