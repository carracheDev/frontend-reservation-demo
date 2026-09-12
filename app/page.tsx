"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays, Check, Presentation, RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardStats, getDashboardStats, getReservations, getSalles, Reservation, Salle } from "@/lib/api-reservations";

function isActive(reservation: Reservation, now: Date) {
  return reservation.statut === "CONFIRMEE" && new Date(reservation.dateDebut) <= now && new Date(reservation.dateFin) > now;
}

function typeIcon(type: Salle["type"]) {
  return type === "CONFERENCE" ? <Presentation size={20} /> : <Users size={20} />;
}

export default function Home() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  async function refreshDashboard(showLoading = false) {
    if (showLoading) setRefreshing(true);
    try {
      const [rooms, bookings, dashboardStats] = await Promise.all([getSalles(), getReservations(), getDashboardStats()]);
      setSalles(rooms); setReservations(bookings); setStats(dashboardStats);
      setError("");
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refreshDashboard(), 0);
    const interval = window.setInterval(() => void refreshDashboard(), 15000);
    const onFocus = () => void refreshDashboard();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initialRefresh);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const now = new Date();
  return <main className="min-h-screen overflow-x-hidden bg-slate-50"><nav className="bg-slate-900 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-5 lg:px-8"><Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950"><CalendarDays size={19} /></span>RoomBook</Link><div className="flex items-center gap-2 text-xs text-slate-300 sm:gap-4 sm:text-sm"><span className="hidden sm:block">Planning d&apos;équipe</span><span className="h-2 w-2 rounded-full bg-emerald-400" /> En ligne</div></div></nav>
    <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 pb-8 pt-9 sm:px-5 sm:pb-10 sm:pt-12 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 sm:text-sm">Vue d&apos;ensemble</p><div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="max-w-xl text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-900 sm:text-4xl">Votre planning, en un coup d&apos;œil.</h1><p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Gérez les espaces de travail de votre équipe sans friction.</p></div><div className="text-xs font-medium capitalize text-slate-500 sm:text-sm">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div></div>
      <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4"><div className="stat"><Building2 className="shrink-0 text-amber-500" size={19} /><div><p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats?.nombreTotalSalles ?? 0}</p><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Salles actives</p></div></div><div className="stat"><CalendarDays className="shrink-0 text-amber-500" size={19} /><div><p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats?.nombreReservationsAujourdhui ?? 0}</p><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Réservations aujourd&apos;hui</p></div></div><div className="stat"><CalendarDays className="shrink-0 text-amber-500" size={19} /><div><p className="text-2xl font-bold text-slate-900">{loading ? "—" : stats?.nombreReservationsAVenir ?? 0}</p><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Réservations à venir</p></div></div><div className="stat"><div className="relative h-10 w-10 shrink-0 rounded-full border-4 border-slate-200"><span className="absolute inset-[-4px] rounded-full border-4 border-amber-400" style={{ clipPath: `inset(${100 - (stats?.tauxOccupationJour ?? 0)}% 0 0 0)` }} /></div><div><p className="text-2xl font-bold text-slate-900">{loading ? "—" : `${stats?.tauxOccupationJour ?? 0}%`}</p><p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Occupation du jour</p></div></div></div>
    </div></section>
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-bold tracking-tight text-slate-900">Espaces de travail</h2><p className="mt-1 text-sm text-slate-500">Sélectionnez une salle pour consulter son planning.</p></div>
        <div className="flex flex-wrap items-center gap-2"><Link href="/reservations" className="rounded-lg px-0 py-2 text-sm font-semibold text-amber-700 transition hover:text-amber-800 sm:px-3 sm:hover:bg-amber-50">Voir toutes les réservations</Link><button type="button" onClick={() => void refreshDashboard(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-700 disabled:opacity-60"><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Actualiser</button></div>
      </div>
      {error && <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && [1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-lg bg-slate-200" />)}
        {!loading && !error && salles.map((salle, index) => {
          const active = reservations.some((item) => item.salleId === salle.id && isActive(item, now));
          return <Link key={salle.id} href={`/salles/${salle.id}`} className="reveal group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md" style={{ animationDelay: `${index * 70}ms` }}><div className="flex items-start justify-between"><span className={`flex items-center gap-2 ${active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} rounded-md px-2.5 py-1 text-xs font-semibold`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-amber-500" : "bg-emerald-500"}`} />{active ? "Occupée" : "Libre maintenant"}</span><ArrowUpRight size={19} className="text-slate-300 transition group-hover:text-amber-500" /></div><div className="mt-8 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">{typeIcon(salle.type)}</div><h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{salle.nom}</h3><div className="mt-3 flex items-center justify-between text-sm text-slate-500"><span>{salle.type === "CONFERENCE" ? "Conférence" : "Réunion"}</span><span className="flex items-center gap-1.5"><Users size={15} /> {salle.capacite} places</span></div></Link>;
        })}
      </div>
    </section>
    <footer className="mx-auto max-w-7xl px-5 pb-8 text-xs text-slate-400 lg:px-8"><span className="inline-flex items-center gap-1.5"><Check size={13} /> Données synchronisées avec RoomBook API</span></footer></main>;
}