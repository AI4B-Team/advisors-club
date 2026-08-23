import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronRight, Building2, User } from "lucide-react";
import { findSection, SETTINGS_SECTIONS, type SettingsGroup, type SettingsRow } from "@/lib/settings/config";
import { PANELS } from "@/components/settings/panels";

export const Route = createFileRoute("/app/settings/$section")({
  loader: ({ params }) => {
    const section = findSection(params.section);
    if (!section) throw notFound();
    return { section };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Settings — Advisors Club" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.section.title} Settings — Advisors Club`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.section.desc },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.section.desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: SectionNotFound,
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useLoaderData();
  return (
    <div className="st-body">
      <header className="st-sec-head">
        <h2>{section.title}</h2>
        <p>{section.desc}</p>
      </header>
      {section.groups.map(g => <Group key={g.title} group={g} />)}
    </div>
  );
}

function Group({ group }: { group: SettingsGroup }) {
  const Icon = group.scope === "club" ? Building2 : User;
  return (
    <section className="st-group">
      <div className="st-group-h">
        <span className={`st-scope st-scope-${group.scope}`}><Icon size={13} /> {group.title}</span>
      </div>
      <div className="st-rows">
        {group.rows.map(r => <Row key={r.id} row={r} />)}
      </div>
    </section>
  );
}

function Row({ row }: { row: SettingsRow }) {
  const [open, setOpen] = useState(false);
  if (row.to) {
    const external = row.to.includes("?");
    const body = (
      <>
        <span className="st-row-t">
          <span className="st-row-l">{row.label}</span>
          <span className="st-row-d">{row.desc}</span>
        </span>
        {row.note && <span className="st-row-note">{row.note}</span>}
        <ChevronRight size={16} className="st-row-go" />
      </>
    );
    return external
      ? <a href={row.to} className="st-row">{body}</a>
      : <Link to={row.to} className="st-row">{body}</Link>;
  }

  const Panel = row.panel ? PANELS[row.panel] : null;
  return (
    <div className={`st-row-wrap${open ? " on" : ""}`}>
      <button className="st-row" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="st-row-t">
          <span className="st-row-l">{row.label}</span>
          <span className="st-row-d">{row.desc}</span>
        </span>
        <ChevronDown size={16} className={`st-row-go${open ? " open" : ""}`} />
      </button>
      {open && Panel && <div className="st-row-panel"><Panel /></div>}
    </div>
  );
}

function SectionNotFound() {
  return (
    <div className="st-body">
      <header className="st-sec-head">
        <h2>Section Not Found</h2>
        <p>Pick A Settings Section To Continue.</p>
      </header>
      <div className="st-rows">
        {SETTINGS_SECTIONS.map(s => (
          <Link key={s.key} to="/app/settings/$section" params={{ section: s.key }} className="st-row">
            <span className="st-row-t">
              <span className="st-row-l">{s.label}</span>
              <span className="st-row-d">{s.desc}</span>
            </span>
            <ChevronRight size={16} className="st-row-go" />
          </Link>
        ))}
      </div>
    </div>
  );
}
