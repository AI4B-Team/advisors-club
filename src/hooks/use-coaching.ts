import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCoaching, newId, saveCoaching, subscribeCoaching, thisMonday,
} from "@/lib/coaching/store";
import type {
  Application, Client, CoachingDoc, CoachingSession, ClientNote, Goal, IntakeForm, PipelineStage, Task,
} from "@/lib/coaching/types";

export function useCoaching() {
  const [doc, setDoc] = useState<CoachingDoc>(() => getCoaching());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDoc(getCoaching());
    setHydrated(true);
    return subscribeCoaching(() => setDoc(getCoaching()));
  }, []);

  const patch = useCallback((fn: (d: CoachingDoc) => CoachingDoc) => {
    setDoc(prev => saveCoaching(fn(prev)));
  }, []);

  const api = useMemo(() => ({
    /* Clients */
    updateClient(id: string, p: Partial<Client>) {
      patch(d => ({ ...d, clients: d.clients.map(c => c.id === id ? { ...c, ...p } : c) }));
    },
    addClient(c: Omit<Client, "id">) {
      const id = newId("c");
      patch(d => ({ ...d, clients: [{ ...c, id }, ...d.clients] }));
      return id;
    },
    /* Pipeline */
    moveToStage(clientId: string, stageId: string) {
      patch(d => ({
        ...d,
        clients: d.clients.map(c => c.id === clientId
          ? { ...c, stageId, lifecycle: stageId === "joined" ? "client" : stageId === "applied" ? "applicant" : c.lifecycle }
          : c),
      }));
    },
    setStages(stages: PipelineStage[]) { patch(d => ({ ...d, stages })); },
    addStage(label: string) {
      patch(d => ({ ...d, stages: [...d.stages, { id: newId("st"), label, color: "#94A3B8" }] }));
    },
    removeStage(id: string) {
      patch(d => ({
        ...d,
        stages: d.stages.filter(s => s.id !== id),
        clients: d.clients.map(c => c.stageId === id ? { ...c, stageId: null } : c),
      }));
    },
    /* Intake forms */
    addForm(f: Omit<IntakeForm, "id">) {
      const id = newId("f");
      patch(d => ({ ...d, forms: [{ ...f, id }, ...d.forms] }));
      return id;
    },
    updateForm(id: string, p: Partial<IntakeForm>) {
      patch(d => ({ ...d, forms: d.forms.map(f => f.id === id ? { ...f, ...p } : f) }));
    },
    removeForm(id: string) { patch(d => ({ ...d, forms: d.forms.filter(f => f.id !== id) })); },
    /* Applications */
    updateApplication(id: string, p: Partial<Application>) {
      patch(d => ({ ...d, applications: d.applications.map(a => a.id === id ? { ...a, ...p } : a) }));
    },
    convertApplication(id: string) {
      patch(d => {
        const app = d.applications.find(a => a.id === id);
        if (!app) return d;
        const today = new Date().toISOString().slice(0, 10);
        if (app.clientId) {
          return {
            ...d,
            applications: d.applications.map(a => a.id === id ? { ...a, status: "converted" } : a),
            clients: d.clients.map(c => c.id === app.clientId
              ? { ...c, lifecycle: "client", stageId: "joined", membership: c.membership === "Free" ? "Pro" : c.membership }
              : c),
          };
        }
        const cid = newId("c");
        const client: Client = {
          id: cid, name: app.name, email: app.email, phone: "", photo: app.photo, location: "",
          lifecycle: "client", stageId: "joined", programIds: [], membership: "Pro",
          joinedAt: today, lastActiveAt: today, engagement: 50, courseProgress: 0, tags: ["New Client"], value: 0,
        };
        return {
          ...d,
          clients: [client, ...d.clients],
          applications: d.applications.map(a => a.id === id ? { ...a, status: "converted", clientId: cid } : a),
        };
      });
    },
    /* Sessions */
    addSession(s: Omit<CoachingSession, "id">) {
      const id = newId("s");
      patch(d => ({ ...d, sessions: [...d.sessions, { ...s, id }] }));
      return id;
    },
    updateSession(id: string, p: Partial<CoachingSession>) {
      patch(d => ({ ...d, sessions: d.sessions.map(s => s.id === id ? { ...s, ...p } : s) }));
    },
    removeSession(id: string) { patch(d => ({ ...d, sessions: d.sessions.filter(s => s.id !== id) })); },
    /* Goals */
    addGoal(g: Omit<Goal, "id">) {
      const id = newId("g");
      patch(d => ({ ...d, goals: [{ ...g, id }, ...d.goals] }));
      return id;
    },
    updateGoal(id: string, p: Partial<Goal>) {
      patch(d => ({ ...d, goals: d.goals.map(g => g.id === id ? { ...g, ...p } : g) }));
    },
    removeGoal(id: string) {
      patch(d => ({ ...d, goals: d.goals.filter(g => g.id !== id), tasks: d.tasks.filter(t => t.goalId !== id) }));
    },
    /* Tasks */
    addTask(t: Omit<Task, "id">) {
      const id = newId("t");
      patch(d => ({ ...d, tasks: [...d.tasks, { ...t, id, weekOf: t.weekOf || thisMonday() }] }));
      return id;
    },
    toggleTask(id: string) {
      patch(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
    },
    removeTask(id: string) { patch(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) })); },
    /* Notes */
    addNote(clientId: string, body: string) {
      const note: ClientNote = { id: newId("n"), clientId, body, createdAt: new Date().toISOString().slice(0, 10), author: "You" };
      patch(d => ({ ...d, notes: [note, ...d.notes] }));
    },
    removeNote(id: string) { patch(d => ({ ...d, notes: d.notes.filter(n => n.id !== id) })); },
  }), [patch]);

  return { doc, hydrated, ...api };
}
