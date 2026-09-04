import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  computeDAGLayout,
  useHostTheme,
} from "cursor/canvas";

function Dag({
  nodes,
  edges,
  label,
}: {
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string }[];
  label: string;
}) {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    nodes,
    edges,
    direction: "horizontal",
    nodeWidth: 150,
    nodeHeight: 36,
    rankGap: 52,
    nodeGap: 14,
    padding: 8,
  });
  const labels = Object.fromEntries(nodes.map((n) => [n.id, n.label]));
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={label}
    >
      {layout.edges.map((e, i) => (
        <line
          key={`${e.from}-${e.to}-${i}`}
          x1={e.sourceX}
          y1={e.sourceY}
          x2={e.targetX}
          y2={e.targetY}
          stroke={theme.stroke.secondary}
          strokeWidth={1}
        />
      ))}
      {layout.nodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x}
            y={n.y}
            width={150}
            height={36}
            rx={4}
            fill={theme.fill.tertiary}
            stroke={theme.stroke.tertiary}
          />
          <text
            x={n.x + 75}
            y={n.y + 23}
            textAnchor="middle"
            fill={theme.text.primary}
            fontSize={11}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {labels[n.id]}
          </text>
        </g>
      ))}
    </svg>
  );
}

const FLOW = [
  { id: "desk", label: "Live desk (existing)" },
  { id: "wallet", label: "SIWE wallet" },
  { id: "std", label: "Standardized subgraph" },
  { id: "maps", label: "Maps subgraph" },
  { id: "compose", label: "compose.ts join" },
  { id: "ai", label: "Decision / Ask AI" },
  { id: "cre", label: "CRE TEE" },
  { id: "chain", label: "Onchain write" },
  { id: "ledger", label: "Ledger confirm" },
];

const EDGES = [
  { from: "desk", to: "wallet" },
  { from: "wallet", to: "std" },
  { from: "wallet", to: "maps" },
  { from: "std", to: "compose" },
  { from: "maps", to: "compose" },
  { from: "compose", to: "ai" },
  { from: "compose", to: "cre" },
  { from: "cre", to: "chain" },
  { from: "cre", to: "ledger" },
];

export default function Architecture() {
  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <Row gap={8} align="center" wrap>
          <H1>TradeCharts Attest — architecture</H1>
          <Pill active size="sm">
            ETHOnline 2026
          </Pill>
        </Row>
        <Text tone="secondary">
          Continuity: an existing live Elliott desk at tradecharts.app. This
          repo is the open-source join — maps as a public record, a conflict
          decision, a confidential flatten workflow, a device confirm. No shared
          git history with the commercial app.
        </Text>
      </Stack>

      <Callout tone="info" title="What this repo is">
        Judges clone this tree. The live desk is a separate product. This module
        speaks Graph, CRE, and Ledger. The desk consumes the same compose
        endpoint the demo/ page uses.
      </Callout>

      <Grid columns={3} gap={12}>
        <Stat value="See" label="Graph — bag ⋈ maps → conflict" />
        <Stat value="Stand" label="Attested Confirm + weekly close" />
        <Stat value="Stop" label="CRE TEE then Ledger" />
      </Grid>

      <H2>How it connects</H2>
      <Dag nodes={FLOW} edges={EDGES} label="Public attest join from desk wallet to Ledger" />

      <H2>This repo</H2>
      <Table
        headers={["Path", "Job"]}
        rows={[
          ["src/validator/", "Same Elliott gate as production. Tests."],
          ["src/policy/", "conflict · hash · kill"],
          ["subgraph/", "Our maps + conflict subgraph (Studio)"],
          ["src/graph/standard.ts", "Standardized token/balance subgraph client"],
          ["src/graph/compose.ts", "Join bag ⋈ maps → aligned / fighting / unmapped"],
          ["cre/", "Confidential Workflow — flatten decision in TEE"],
          ["demo/", "Paste or connect a wallet; live Graph rows. No desk required."],
        ]}
      />

      <H2>Existing product (not this tree)</H2>
      <Text size="small" tone="secondary">
        tradecharts.app already has candles, SIWE, a read-only book, Propose →
        validator → Confirm. Confirm is still private JSON. Flatten is not
        shipped there until this module is wired. We do not publish that
        codebase.
      </Text>

      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>Live desk</CardHeader>
          <CardBody>
            <Text size="small">https://tradecharts.app — testers. Thin consumer of compose.</Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>This module</CardHeader>
          <CardBody>
            <Text size="small">github.com/AiAlchemist0/tradecharts-attest — judges. Frequent commits.</Text>
          </CardBody>
        </Card>
      </Grid>

      <Divider />
      <Text tone="tertiary" size="small">
        Event work: Graph wiring, CRE, Ledger, demo/. Pre-existing: desk, validator
        copy, SIWE, book reads. Not a signal. Kill is a close.
      </Text>
    </Stack>
  );
}
