import {
  Calculator, ClipboardList, Target, BarChart3, Sparkles, ListChecks,
  Wand2, Gauge, Wrench, Layers,
} from "lucide-react";
import type { ReactElement } from "react";
import type { AppIconKey } from "@/lib/apps/types";

export const APP_ICON_KEYS: AppIconKey[] = [
  "calculator", "clipboard", "target", "chart", "sparkles", "list", "wand", "gauge", "wrench", "layers",
];

export function appIcon(key: AppIconKey, size = 17): ReactElement {
  switch (key) {
    case "clipboard": return <ClipboardList size={size} />;
    case "target": return <Target size={size} />;
    case "chart": return <BarChart3 size={size} />;
    case "sparkles": return <Sparkles size={size} />;
    case "list": return <ListChecks size={size} />;
    case "wand": return <Wand2 size={size} />;
    case "gauge": return <Gauge size={size} />;
    case "wrench": return <Wrench size={size} />;
    case "layers": return <Layers size={size} />;
    default: return <Calculator size={size} />;
  }
}
