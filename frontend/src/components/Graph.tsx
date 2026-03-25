import { useEffect, useRef } from "react";
import * as d3 from "d3";

// ---- Types ----
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
}| null;

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

    // ---- zoom container ----
    const g = svg.append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    );

    // ---- nodes/links ----
    const nodes: Node[] =
      data.nodes.length > 0 ? data.nodes : [{ id: "placeholder" }];

    const links: Link[] = data.links ?? [];

    // ---- color by folder ----
    const color = (d: Node) => {
      if (d.id.includes("components")) return "#8b5cf6";
      if (d.id.includes("pages")) return "#22c55e";
      if (d.id.includes("utils")) return "#f59e0b";
      if (d.id.includes("server")) return "#ef4444";
      return "#3b82f6";
    };

    function getId(val: any) {
      return typeof val === "string" ? val : val.id;
    }

    const connected = new Set<string>();

    if (selectedFile) {
      links.forEach((l: any) => {
        const source = getId(l.source);
        const target = getId(l.target);

        if (source === selectedFile) {
          connected.add(target); // imports
        }

        if (target === selectedFile) {
          connected.add(source); // dependents
        }
      });
    }


    // ---- simulation ----
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(70)
      )
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
        if (!selectedFile) return "#999";

        const source = getId(l.source);
        const target = getId(l.target);

        if (source === selectedFile) return "#4dabf7"; // imports
        if (target === selectedFile) return "#51cf66"; // dependents

        return "#eee"; // faded
      })
      .attr("stroke-width", (l: any) => {
        const source = getId(l.source);
        const target = getId(l.target);

        if (source === selectedFile || target === selectedFile) return 2.5;
        return 1;
      })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5);

    // ---- nodes ----
    const node = g
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 12)
      .attr("fill", (d) => {
        if (search && d.id.toLowerCase().includes(search.toLowerCase())) {
          return "#ffd43b"; 
        }

        if (!selectedFile) return "steelblue";

        if (d.id === selectedFile) return "#ff5555";

        if (connected.has(d.id)) return "#4dabf7";

        return "#ddd";
      })
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

        return 0.3;
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

      node.attr("opacity", (n: Node) =>
        connected.has(n.id) ? 1 : 0.15
      );

      link.attr("opacity", (l: any) => {
        const s = (l.source as any).id || l.source;
        const t = (l.target as any).id || l.target;

        return s === clicked.id || t === clicked.id ? 1 : 0.1;
      });
    });

    // ---- labels ----
    const text = g
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("font-size", 11)
      .attr("fill", "#333")
      .attr("pointer-events", "none")
      .attr("dx", 14)
      .attr("dy", 4);

    // ---- hover ----
    node.on("mouseover", (_, hovered) => {
      node.attr("fill", (n: Node) =>
        n.id === hovered.id ? "orange" : color(n)
      );
    });

    node.on("mouseout", () => {
      node.attr("fill", color);
    });

    // ---- click ----
    node.on("click", (_, d) => {
      onNodeClick?.(d.id);
    });

    node.attr("stroke", (d: any) =>
      d.id === selectedFile ? "black" : null
    );

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

    // ---- auto cleanup ----
    return () => {
      simulation.stop();
    };
  }, [data, selectedFile, search]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={ref}
        width="100%"
        height="100%"
        style={{ border: "1px solid #ddd", background: "#fafafa" }}
      />
    </div>
  );
}