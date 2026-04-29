import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Node = {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type Link = {
  source: string | Node;
  target: string | Node;
};

type GraphData = {
  nodes: Node[];
  links: Link[];
  backLinks: Record<string, string[]>;
} | null;

export default function Graph({
  data,
  onNodeClick,
  selectedFile,
  search,
}: {
  data: GraphData;
  onNodeClick?: (id: string) => void;
  selectedFile?: string | null;
  search?: string;
}) {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || !ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = rect.width;
    const height = rect.height;

    const g = svg.append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    );

    const nodes: Node[] =
      data.nodes.length > 0 ? data.nodes : [{ id: "placeholder" }];
    const links: Link[] = data.links ?? [];

    // ---- color by folder —---
    const color = (d: Node) => {
      if (d.id.includes("components")) return "#818cf8"; // indigo
      if (d.id.includes("pages"))      return "#34d399"; // emerald
      if (d.id.includes("utils"))      return "#fbbf24"; // amber
      if (d.id.includes("server"))     return "#f87171"; // red
      return "#38bdf8";                                  // sky 
    };

    function getId(val: any) {
      return typeof val === "string" ? val : val.id;
    }

    const connected = new Set<string>();
    if (selectedFile) {
      links.forEach((l: any) => {
        const source = getId(l.source);
        const target = getId(l.target);
        if (source === selectedFile) connected.add(target);
        if (target === selectedFile) connected.add(source);
      });
    }

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id((d) => d.id).distance(70))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force("collide", d3.forceCollide(28));

    // ---- links ----
    const link = g
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (l: any) => {
        if (!selectedFile) return "rgba(56,189,248,0.2)";
        const source = getId(l.source);
        const target = getId(l.target);
        if (source === selectedFile) return "#38bdf8"; // imports → cyan
        if (target === selectedFile) return "#818cf8"; // dependents → indigo
        return "rgba(255,255,255,0.06)";              // faded
      })
      .attr("stroke-width", (l: any) => {
        const source = getId(l.source);
        const target = getId(l.target);
        return source === selectedFile || target === selectedFile ? 2 : 1;
      })
      .attr("stroke-opacity", 0.8);

    // ---- nodes ----
    const node = g
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d) => {
        if (search && d.id.toLowerCase().includes(search.toLowerCase()))
          return "#fbbf24";
        if (!selectedFile) return color(d);
        if (d.id === selectedFile) return "#38bdf8";
        if (connected.has(d.id)) return "#818cf8";
        return "rgba(255,255,255,0.08)";
      })
      .attr("stroke", (d: any) =>
        d.id === selectedFile
          ? "rgba(56,189,248,0.8)"
          : "rgba(255,255,255,0.08)"
      )
      .attr("stroke-width", (d: any) => (d.id === selectedFile ? 2.5 : 1))
      .call(
        d3
          .drag<SVGCircleElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .attr("opacity", (d: any) => {
        if (!selectedFile) return 1;
        if (d.id === selectedFile || connected.has(d.id)) return 1;
        return 0.2;
      });

    node.on("click", (_, clicked) => {
      const connected = new Set<string>();
      links.forEach((l: any) => {
        const s = (l.source as any).id || l.source;
        const t = (l.target as any).id || l.target;
        if (s === clicked.id || t === clicked.id) {
          connected.add(s);
          connected.add(t);
        }
      });
      node.attr("opacity", (n: Node) => (connected.has(n.id) ? 1 : 0.15));
      link.attr("opacity", (l: any) => {
        const s = (l.source as any).id || l.source;
        const t = (l.target as any).id || l.target;
        return s === clicked.id || t === clicked.id ? 1 : 0.08;
      });
    });

    // ---- labels ----
    const text = g
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("font-size", 10)
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("fill", "rgba(148,163,184,0.75)")
      .attr("pointer-events", "none")
      .attr("dx", 14)
      .attr("dy", 4);

    // ---- hover ----
    node.on("mouseover", (_, hovered) => {
      node.attr("fill", (n: Node) =>
        n.id === hovered.id ? "#e2e8f0" : color(n)
      );
    });

    node.on("mouseout", () => {
      node.attr("fill", color);
    });

    node.on("click", (_, d) => {
      onNodeClick?.(d.id);
    });

    // ---- tick ----
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as Node).x!)
        .attr("y1", (d: any) => (d.source as Node).y!)
        .attr("x2", (d: any) => (d.target as Node).x!)
        .attr("y2", (d: any) => (d.target as Node).y!);
      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      text.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    return () => { simulation.stop(); };
  }, [data, selectedFile, search]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={ref}
        width="100%"
        height="100%"
        style={{ background: "#050810" }}
      />
    </div>
  );
}