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
} | null;

// ---- Component ----
export default function Graph({ data }: { data: GraphData }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // fallback if empty
    const nodes: Node[] =
      data.nodes.length > 0 ? data.nodes : [{ id: "placeholder" }];

    const links: Link[] = data.links ?? [];

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(300, 200));

    // ---- Links ----
    const link = svg
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "gray");

    // ---- Nodes ----
    const node = svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 12)
      .attr("fill", "blue")
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
      );

    // ---- Labels ----
    const labels = svg
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

    // ---- Tick ----
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      node
        .attr("cx", (d) => d.x!)
        .attr("cy", (d) => d.y!);

      labels
        .attr("x", (d) => d.x!)
        .attr("y", (d) => d.y! - 15);
    });

    // ---- Cleanup ----
    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <svg
      ref={ref}
      width={600}
      height={400}
      style={{ border: "1px solid black" }}
    />
  );
}