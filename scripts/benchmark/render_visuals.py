"""Render benchmark visual evidence (B21) as SVG.

    python scripts/benchmark/render_visuals.py [caseId]

Reads the git-ignored local results (blind summaries, comparisons, reproducibility,
evidence-pack item list) and writes aggregate, pseudonymised SVG charts to
docs/progress/benchmark/. These are generated charts, not screenshots; every value
drawn is printed to stdout so it can be checked against the JSON it came from.
"""
import json, os, sys
from collections import Counter
from html import escape

CASE = sys.argv[1] if len(sys.argv) > 1 else "us-v-ulbricht-sdny-14cr68"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RES = os.path.join(ROOT, "benchmark", "results", CASE)
CASE_DIR = os.path.join(ROOT, "benchmark", "cases", CASE)
OUT = os.path.join(ROOT, "docs", "progress", "benchmark")
os.makedirs(OUT, exist_ok=True)

BG, INK, MUTED, RULE = "#FFFFFF", "#16201C", "#5B6862", "#D5DCD8"
SEAL, AMBER, RED, GREY, BLUE = "#0E6E63", "#B7791F", "#A63A32", "#8A958F", "#2F5D8A"
FONT = "font-family='IBM Plex Sans, Segoe UI, Arial, sans-serif'"


def load(name):
    return json.load(open(os.path.join(RES, name), encoding="utf8"))


def svg(w, h, body, title):
    return (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' width='{w}' height='{h}' {FONT}>"
            f"<title>{escape(title)}</title><rect width='{w}' height='{h}' fill='{BG}'/>{body}</svg>\n")


def text(x, y, s, size=13, fill=INK, anchor="start", weight="400"):
    return f"<text x='{x}' y='{y}' font-size='{size}' fill='{fill}' text-anchor='{anchor}' font-weight='{weight}'>{escape(str(s))}</text>"


def write(name, content):
    open(os.path.join(OUT, name), "w", encoding="utf8", newline="\n").write(content)
    print("wrote", name)


# 1. metrics: outcome counts per pack ------------------------------------------------
outcomes = ["recovered", "partially_recovered", "missed", "correctly_absent", "false_link", "not_scorable"]
colors = {"recovered": SEAL, "partially_recovered": "#7FB5AC", "missed": RED, "correctly_absent": BLUE, "false_link": AMBER, "not_scorable": GREY}
runs = [("run-1", "v1.0 official blind run"), ("v1.1-run-1", "v1.1 diagnostic (structural completion)")]
body, y = [text(24, 36, "Ground-truth comparison — outcomes per assertion (22 assertions)", 16, weight="600")], 70
for label, name in runs:
    c = load(f"comparison.{label}.json")
    t = c["scoreTable"]
    body.append(text(24, y, name, 13, weight="600"))
    x, scale = 24, 30
    for o in outcomes:
        n = t["byOutcome"][o]
        if n:
            body.append(f"<rect x='{x}' y='{y + 10}' width='{n * scale}' height='28' fill='{colors[o]}'/>")
            body.append(text(x + n * scale / 2, y + 29, n, 12, "#FFFFFF", "middle", "600"))
            x += n * scale
    body.append(text(24, y + 58, f"positive credit {t['positiveRecall']:.2f} (recovered = 1, partial = 0.5; {t['scorable']} scorable) · negatives correctly absent {t['negativeSpecificity']:.2f}", 12, MUTED))
    print(label, t)
    y += 96
lx = 24
for o in outcomes:
    body.append(f"<rect x='{lx}' y='{y}' width='12' height='12' fill='{colors[o]}'/>")
    body.append(text(lx + 18, y + 11, o.replace("_", " "), 12, MUTED))
    lx += 18 + len(o) * 7 + 22
write("benchmark-metrics.svg", svg(760, y + 30, "".join(body), "Benchmark metrics"))

# 2. failure categories -------------------------------------------------------------
fail = Counter({
    "ENTITY-RESOLUTION FAILURE": 2,       # GT-ID-1 partial (fragmentation), GT-TX-1 (ambiguous wallet holder)
    "GRAPH CONSTRUCTION FAILURE (G2)": 3,  # GT-REL-1, GT-REL-2, GT-ID-3 in v1.0
    "ANALYTICS FAILURE (no contradiction type)": 1,  # GT-CON-1
    "MISSING SOURCE (not transcribed)": 1,  # GT-ALIAS-1
    "INSUFFICIENT PUBLIC EVIDENCE": 1,  # GT-NEG-5 (excluded at trial)
    "SCHEMA LIMIT (not scorable)": 4,     # GT-EV-1, GT-FOR-2, GT-FOR-3, GT-ROLE-1
    "BY DESIGN (no culpability output)": 3,  # GT-OUT-1..3
})
body = [text(24, 36, "Why assertions were not recovered — v1.0 blind run", 16, weight="600")]
y, maxn = 64, max(fail.values())
for k, n in fail.most_common():
    body.append(text(24, y + 17, k, 12))
    body.append(f"<rect x='340' y='{y + 4}' width='{n / maxn * 360}' height='18' fill='{RED if 'FAILURE' in k else GREY}'/>")
    body.append(text(346 + n / maxn * 360, y + 18, n, 12, MUTED))
    y += 30
body.append(text(24, y + 16, "Counts are assertions, from docs/benchmark/us-v-ulbricht-sdny-14cr68-FINAL-BENCHMARK-REPORT.md §17.", 11, MUTED))
write("failure-categories.svg", svg(760, y + 36, "".join(body), "Failure categories"))
print("failures", dict(fail))

# 3. arrest-window timeline ---------------------------------------------------------
events = [
    ("21:47:00", "DPR goes offline in staff chat", "EV-DPR-OFFLINE", GREY),
    ("22:05:00", "Defendant enters library (estimate)", "EV-DEF-ENTERS-LIBRARY", AMBER),
    ("22:08:41", "DPR comes online", "EV-DPR-ONLINE", SEAL),
    ("22:09:11", "Cirrus ↔ DPR chat starts (308 s)", "CDR-UC-DPR-1001", BLUE),
    ("22:15:00", "Arrest (approx.)", "EV-ARREST", RED),
    ("22:15:56", "Laptop photo: chat with Cirrus open", "CDR-LAPTOP-CIRRUS", BLUE),
]
def secs(t):
    h, m, s = map(int, t.split(":")); return h * 3600 + m * 60 + s
t0, t1 = secs("21:45:00"), secs("22:20:00")
X0, X1 = 40, 860
xp = lambda t: X0 + (secs(t) - t0) / (t1 - t0) * (X1 - X0)
body = [text(24, 34, "Arrest window, 1 Oct 2013 (UTC) — evidence items as transcribed", 16, weight="600")]
body.append(f"<rect x='{xp('22:09:11')}' y='56' width='{xp('22:15:56') - xp('22:09:11')}' height='260' fill='#D8ECE8'/>")
body.append(text(xp('22:09:11') + 4, 70, "temporal co-occurrence found (22:09:11–22:15:56)", 11, SEAL))
body.append(f"<line x1='{X0}' y1='300' x2='{X1}' y2='300' stroke='{RULE}' stroke-width='2'/>")
for tick in ["21:45:00", "21:50:00", "21:55:00", "22:00:00", "22:05:00", "22:10:00", "22:15:00", "22:20:00"]:
    body.append(f"<line x1='{xp(tick)}' y1='296' x2='{xp(tick)}' y2='304' stroke='{MUTED}'/>")
    body.append(text(xp(tick), 322, tick[:5], 11, MUTED, "middle"))
for i, (t, label, ref, col) in enumerate(events):
    yy = 96 + i * 32
    body.append(f"<line x1='{xp(t)}' y1='{yy + 4}' x2='{xp(t)}' y2='300' stroke='{col}' stroke-dasharray='3 3'/>")
    body.append(f"<circle cx='{xp(t)}' cy='{yy}' r='5' fill='{col}'/>")
    anchor = "end" if xp(t) > 600 else "start"
    dx = -10 if anchor == "end" else 10
    body.append(text(xp(t) + dx, yy + 4, f"{t}  {label}  [{ref}]", 12, INK, anchor))
write("arrest-timeline.svg", svg(900, 340, "".join(body), "Arrest timeline"))

# 4. reconstructed identity subgraph (v1.0) -----------------------------------------
s = load("blind-summary.run-1.json")
nodes = {
    "DPR": (130, 120, "Dread Pirate Roberts", "person (site persona)"),
    "DPRKEY": (130, 300, "Dread Pirate Roberts", "person · alias 'Ross Ulbricht' (fragment C)"),
    "KEY": (420, 300, "PGP key token", "bank_account kind (G1)"),
    "SRACC": (330, 120, "Silk Road DPR account", "phone kind (G1)"),
    "DEV": (540, 120, "Seized laptop", "imei kind (G1)"),
    "OS": (740, 120, "OS login 'frosty'", "phone kind (G1)"),
    "B": (740, 300, "Ross Ulbricht", "fragment B (laptop)"),
    "A": (740, 440, "Ross Ulbricht", "fragment A · aliases altoid, frosty — no edges in v1.0"),
    "PID": (540, 30, "Pidgin account", "phone kind"),
    "ALT": (130, 440, "Investigated person ALT-1", "no path to DPR (correct)"),
}
edges = [("DPR", "SRACC", "ownership"), ("SRACC", "DEV", "ownership"), ("OS", "DEV", "ownership"), ("B", "OS", "ownership"),
         ("DPRKEY", "KEY", "ownership"), ("PID", "DEV", "ownership")]
body = [text(24, 22, "", 1)]
for a, b, lab in edges:
    (x1, y1, *_), (x2, y2, *_) = nodes[a], nodes[b]
    body.append(f"<line x1='{x1}' y1='{y1}' x2='{x2}' y2='{y2}' stroke='{MUTED}' stroke-width='2'/>")
body.append(f"<path d='M 130 150 C 60 200, 60 250, 130 280' stroke='{AMBER}' stroke-width='2' stroke-dasharray='5 4' fill='none'/>")
body.append(text(52, 215, "same label, separate", 11, AMBER, "middle"))
body.append(text(52, 229, "entities", 11, AMBER, "middle"))
for key, (x, y, label, sub) in nodes.items():
    col = SEAL if "person" in sub or "fragment" in sub or "Investigated" in label else BLUE
    if key == "ALT": col = GREY
    body.append(f"<rect x='{x - 95}' y='{y - 22}' width='190' height='44' rx='4' fill='#FFFFFF' stroke='{col}' stroke-width='2'/>")
    body.append(text(x, y - 3, label, 12, INK, "middle", "600"))
    body.append(text(x, y + 13, sub, 9.5, MUTED, "middle"))
body.append(text(24, 505, "v1.0 blind run: DPR ↔ Ross Ulbricht (fragment B) by a 4-hop path through the seized laptop; fragment C merged with DPR via the PGP key.", 12, INK))
body.append(text(24, 523, "Fragment A (Gmail-linked accounts) had no edges because its identifiers never became canonical entities (gap G2). Tokens not shown.", 12, MUTED))
write("reconstructed-graph.svg", svg(880, 540, "".join(body), "Reconstructed identity graph"))
print("paths", [(p["hops"], p["from"], p["to"]) for p in s["personPaths"]])

# 5. evidence structure -------------------------------------------------------------
items = json.load(open(os.path.join(CASE_DIR, "normalized", "items.json"), encoding="utf8"))
by_type = Counter(i["itemType"] for i in items)
by_doc = Counter(i["citation"]["doc"] for i in items)
doc_names = {196: "Tr. 1/13", 198: "Tr. 1/14", 200: "Tr. 1/15", 202: "Tr. 1/20", 204: "Tr. 1/21", 208: "Tr. 1/22", 210: "Tr. 1/26", 212: "Tr. 1/29", 214: "Tr. 1/28", 218: "Tr. 2/3", 52: "Indictment (allegation)"}
snap_counts = load("blind-summary.run-1.json")["counts"]
body = [text(24, 34, "Evidence pack v1.0 → pipeline (blind run v1.0)", 16, weight="600")]
body.append(text(24, 62, "Items by source document", 12, MUTED, weight="600"))
y = 76
for d, n in sorted(by_doc.items(), key=lambda kv: -kv[1]):
    body.append(text(24, y + 13, doc_names.get(d, d), 12))
    body.append(f"<rect x='190' y='{y + 2}' width='{n * 9}' height='14' fill='{BLUE}'/>")
    body.append(text(196 + n * 9, y + 14, n, 11, MUTED))
    y += 22
y2 = 76
body.append(text(430, 62, "Items by type", 12, MUTED, weight="600"))
for t, n in by_type.most_common():
    body.append(text(430, y2 + 13, t, 12))
    body.append(f"<rect x='640' y='{y2 + 2}' width='{n * 9}' height='14' fill='{SEAL}'/>")
    body.append(text(646 + n * 9, y2 + 14, n, 11, MUTED))
    y2 += 22
y = max(y, y2) + 20
stages = [("evidence items", snap_counts["evidenceItems"]), ("extracted records", snap_counts["extractedRecords"]), ("entities", snap_counts["entities"]),
          ("person entities", snap_counts["personEntities"]), ("relationships", snap_counts["relationships"]), ("analytical signals", snap_counts["analyticalSignals"]),
          ("corroboration findings", snap_counts["corroborationFindings"])]
x = 24
for i, (lab, n) in enumerate(stages):
    body.append(f"<rect x='{x}' y='{y}' width='118' height='54' rx='4' fill='#FFFFFF' stroke='{RULE}' stroke-width='1.5'/>")
    body.append(text(x + 59, y + 24, n, 18, INK, "middle", "600"))
    body.append(text(x + 59, y + 42, lab, 10, MUTED, "middle"))
    if i < len(stages) - 1:
        body.append(text(x + 124, y + 31, "→", 14, MUTED))
    x += 132
write("evidence-structure.svg", svg(960, y + 80, "".join(body), "Evidence structure"))
print("by_doc", dict(by_doc), "by_type", dict(by_type), "counts", snap_counts)

# 6. aggregate metrics (committed; no case content beyond pseudonymised assertion ids) ----
repro = {}
for pair in (("run-1", "run-2"), ("v1.1-run-1", "v1.1-run-2")):
    for label in pair:
        meta = json.load(open(os.path.join(RES, "blind-run", label, "run-metadata.json"), encoding="utf8"))
        repro[label] = {"evidencePackSha256": meta["evidencePackSha256"], "gitCommit": meta["gitCommit"], "nodeVersion": meta["nodeVersion"],
                        "stages": [{"stage": s["stage"], "status": s["status"]} for s in meta["stages"]]}
reproducibility = load("reproducibility.json")
coverage = json.load(open(os.path.join(CASE_DIR, "normalized", "coverage.json"), encoding="utf8"))
metrics = {
    "caseId": CASE,
    "dataClass": "real judicial record, local-only (owner decision B)",
    "runs": {},
    "reproducibility": {"lastComparison": {k: reproducibility[k] for k in ("samePack", "identical", "tolerance")}, "runs": repro},
    "transcriptionCoverage": {k: coverage[k] for k in ("candidates", "candidatesInCitedSpans", "testimonyLines", "testimonyLinesInCitedSpans")},
}
for label, name in runs:
    c = load(f"comparison.{label}.json")
    metrics["runs"][label] = {
        "name": name,
        "groundTruthSha256": c["groundTruthSha256"],
        "scorerVersion": c.get("scorerVersion"),
        "scoreTable": c["scoreTable"],
        "assertionOutcomes": {a["id"]: a["outcome"] for a in c["assertions"]},
        "entityResolution": {k: c["entityResolution"][k] for k in ("entitiesCarryingDefendantName", "identifierAnchoredDefendantFragments", "resolutionTypes")},
        "counts": load(f"blind-summary.{label}.json")["counts"],
    }
rep_dir = os.path.join(ROOT, "reports", "benchmark", CASE)
os.makedirs(rep_dir, exist_ok=True)
open(os.path.join(rep_dir, "metrics.json"), "w", encoding="utf8", newline="\n").write(json.dumps(metrics, indent=2, sort_keys=True) + "\n")
print("wrote reports/benchmark/%s/metrics.json" % CASE)
