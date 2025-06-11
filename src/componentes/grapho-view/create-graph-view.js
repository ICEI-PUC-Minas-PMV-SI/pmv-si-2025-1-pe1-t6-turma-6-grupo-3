// Requisitos: incluir Bootstrap Icons no HTML
// <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">


function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

function parseToGraphNodes(notebooks, contents, contentNodes, options) {
  const nodesMap = new Map();
  const links = [];

  const notebookColorMap = new Map();
  const showTags = options?.showTags ?? true;
  const showNotebooks = options?.showNotebooks ?? true;
  const showContents = options?.showContents ?? true;

  const tagReferences = new Map(); // tagId -> { color, sources: [id1, id2...] }

  // 1. Notebooks
  for (const notebook of notebooks) {
    const notebookId = `notebook-${notebook.id}`;
    const color = notebook.color || getRandomColor();

    if (showNotebooks) {
      nodesMap.set(notebookId, {
        id: notebookId,
        type: "notebook",
        name: notebook.name,
        icon: notebook.icon,
        color,
        weight: 1
      });
    }

    notebookColorMap.set(notebook.id, color);

    if (showTags) {
      for (const tag of notebook.tags || []) {
        const tagId = `tag-${tag.name.toLowerCase()}`;
        const ref = tagReferences.get(tagId) || {
          name: tag.name,
          color: tag.color,
          sources: []
        };
        ref.sources.push(notebookId);
        tagReferences.set(tagId, ref);
      }
    }
  }

  // 2. Contents
  for (const content of contents) {
    const contentId = `content-${content.notebook_id}-${content.content_id}`;
    const color = notebookColorMap.get(content.notebook_id) || "#ccc";

    if (showContents) {
      nodesMap.set(contentId, {
        id: contentId,
        type: "content",
        name: content.name,
        icon: content.icon,
        color,
        weight: 1
      });
    }

    if (showContents && showNotebooks) {
      const notebookId = `notebook-${content.notebook_id}`;
      if (nodesMap.has(notebookId)) {
        links.push({ source: notebookId, target: contentId });
        nodesMap.get(notebookId).weight++;
      }
    }

    if (showTags) {
      for (const tag of content.tags || []) {
        const tagId = `tag-${tag.name.toLowerCase()}`;
        const ref = tagReferences.get(tagId) || {
          name: tag.name,
          color: tag.color,
          sources: []
        };
        ref.sources.push(contentId);
        tagReferences.set(tagId, ref);
      }
    }
  }

  // 3. Adiciona tags e links delas
  if (showTags) {
    for (const [tagId, tagData] of tagReferences.entries()) {
      if (!nodesMap.has(tagId)) {
        console.log("tagdata", tagData)
        nodesMap.set(tagId, {
          id: tagId,
          type: "tag",
          name: tagData.name,
          color: tagData.color,
          weight: tagData.sources.length
        });
      }

      for (const sourceId of tagData.sources) {
        // só adiciona se o source existe (caso showNotebook/showContent esteja ativo)
        if (nodesMap.has(sourceId)) {
          links.push({ source: sourceId, target: tagId });
          nodesMap.get(sourceId).weight = (nodesMap.get(sourceId).weight || 1) + 1;
        }
      }
    }
  }

  // 4. Internal bookmarks (somente se conteúdos ativados)
  if (showContents) {
    for (const node of contentNodes) {
      if (node.type !== "bookmark-internal") continue;
      const fromId = `content-${node.notebook_id}-${node.content_id}`;
      const loc = node.value.localization || {};

      let targetId = null;
      if (node.value.type === "notebook" && showNotebooks) {
        targetId = `notebook-${loc.notebook_id}`;
      } else if (node.value.type === "content" && loc.content_id) {
        targetId = `content-${loc.notebook_id}-${loc.content_id}`;
      }

      if (!targetId || targetId === fromId) continue;

      links.push({ source: fromId, target: targetId });
      if (nodesMap.has(fromId)) nodesMap.get(fromId).weight++;
      if (nodesMap.has(targetId)) nodesMap.get(targetId).weight++;
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links
  };
}

const options = {
  showTags: true,
  showNotebooks: true,
  showContents: true
};

// const { nodes, links } = generateNodesAndLinksWithNotebooksAndContents(notebooks, contents, contentNodes, options);

// Renderiza com D3
const center = { x: 0, y: 0 };
const container = document.getElementById("graphContainer");
const width = window.innerWidth;
const height = window.innerHeight;
function getGraphoControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleLabel,
  onChangeFilter,
}) {
  const options = {
    showTags: true,
    showNotebooks: true,
    showContents: true
  };

  // Container de controles de zoom
  const zoomControlsContainer = document.createElement("div");
  zoomControlsContainer.style.position = "static";
  zoomControlsContainer.style.width = "150px";
  zoomControlsContainer.style.zIndex = "1000";
  zoomControlsContainer.style.display = "inline-flex";
  zoomControlsContainer.style.gap = "8px";
  zoomControlsContainer.className = "btn-group";

  const zoomInBtn = document.createElement("button");
  zoomInBtn.textContent = "+";
  zoomInBtn.className = "btn btn-primary btn-sm";
  zoomInBtn.setAttribute("alt", "Aumentar zoom");
  zoomInBtn.setAttribute("title", "Aumentar zoom");

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "⭯";
  resetBtn.className = "btn btn-secondary btn-sm";
  resetBtn.setAttribute("alt", "Resetar visualização");
  resetBtn.setAttribute("title", "Resetar visualização");

  const zoomOutBtn = document.createElement("button");
  zoomOutBtn.textContent = "-";
  zoomOutBtn.className = "btn btn-primary btn-sm";
  zoomOutBtn.setAttribute("alt", "Diminuir zoom");
  zoomOutBtn.setAttribute("title", "Diminuir zoom");

  zoomControlsContainer.appendChild(zoomInBtn);
  zoomControlsContainer.appendChild(resetBtn);
  zoomControlsContainer.appendChild(zoomOutBtn);

  // Botão toggle de rótulos
  const toggleLabelsBtn = document.createElement("button");
  toggleLabelsBtn.textContent = "🔤 Mostrar/Ocultar Nomes";
  toggleLabelsBtn.className = "btn btn-outline-secondary btn-sm btn-graph-settings";
  toggleLabelsBtn.style.marginLeft = "8px";
  // toggleLabelsBtn.style.marginLeft = "8px";
  toggleLabelsBtn.setAttribute("alt", "Mostrar/Ocultar rótulos");
  toggleLabelsBtn.setAttribute("title", "Mostrar/Ocultar rótulos");

  // Botão Dropdown de filtros
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "dropdown";
  dropdownContainer.style.position = "relative";
  dropdownContainer.style.display = "inline-block";
  dropdownContainer.style.marginTop = "12px";
  dropdownContainer.style.marginLeft = "4px";

  const dropdownBtn = document.createElement("button");
  dropdownBtn.className = "btn btn-outline-secondary btn-sm dropdown-toggle btn-graph-settings";
  dropdownBtn.textContent = "Filtros";
  dropdownBtn.onclick = () => {
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
  };

  const dropdownMenu = document.createElement("div");
  dropdownMenu.className = "dropdown-menu p-3";
  dropdownMenu.style.display = "none";
  dropdownMenu.style.position = "absolute";
  dropdownMenu.style.backgroundColor = "white";
  dropdownMenu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";
  dropdownMenu.style.minWidth = "200px";
  dropdownMenu.style.zIndex = "1001";
  dropdownMenu.style.borderRadius = "6px";

  const checkboxes = [
    { id: "showTags", label: "Tags" },
    { id: "showNotebooks", label: "Notebooks" },
    { id: "showContents", label: "Conteúdos" }
  ];

  checkboxes.forEach(({ id, label }) => {
    const div = document.createElement("div");
    div.className = "form-check";

    const input = document.createElement("input");
    input.className = "form-check-input";
    input.type = "checkbox";
    input.id = id;
    input.checked = true;

    const labelEl = document.createElement("label");
    labelEl.className = "form-check-label";
    labelEl.htmlFor = id;
    labelEl.textContent = label;

    div.appendChild(input);
    div.appendChild(labelEl);
    dropdownMenu.appendChild(div);
  });

  const applyBtn = document.createElement("button");
  applyBtn.className = "btn btn-sm btn-primary mt-2 w-100";
  applyBtn.textContent = "Aplicar";
  applyBtn.onclick = () => {
    options.showTags = document.getElementById("showTags").checked;
    options.showNotebooks = document.getElementById("showNotebooks").checked;
    options.showContents = document.getElementById("showContents").checked;

    console.log("Selecionados:" ,options, Object.entries(options).filter(([, v]) => v).map(([k]) => k));
    onChangeFilter(options)
    dropdownMenu.style.display = "none";
  };

  dropdownMenu.appendChild(applyBtn);
  dropdownContainer.appendChild(dropdownBtn);
  dropdownContainer.appendChild(dropdownMenu);

  // Container final
  const controlsContainer = document.createElement("div");
  controlsContainer.appendChild(zoomControlsContainer);
  controlsContainer.appendChild(toggleLabelsBtn);
  controlsContainer.appendChild(dropdownContainer);

  // Eventos dos botões
  zoomInBtn.onclick = onZoomIn;
  zoomOutBtn.onclick = onZoomOut;
  resetBtn.onclick = onReset;
  toggleLabelsBtn.onclick = onToggleLabel;

  return controlsContainer;
}



const parseType = str => {
  switch (str) {
    case "notebook":
      return "Caderno"
    case "content":
      return "Conteúdo"
    case "tag":
      return "Tag"
  }
}

function createGrapho(nodes, links, {clickNode}) {
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("background", "#fff")
    .style("touch-action", "none")
    .style("display", "block")
    .style("max-width", "100%")
    .style("height", "100vh");

  const zoomGroup = svg.append("g");

  const zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", (event) => {
      zoomGroup.attr("transform", event.transform);
    });

  svg.call(zoomBehavior);

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#333")
    .style("color", "white")
    .style("padding", "5px 8px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("z-index", 10);

  
  const ticked = function () {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
  }
  
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100).strength(0.2))
    .force("charge", d3.forceManyBody().strength(d => -800 - Math.log2(d.weight + 1) * 300))
    .force("collision", d3.forceCollide().radius(d => 40 + Math.log2(d.weight + 1) * 5).strength(1.2))
    .force("radial", d3.forceRadial(d => {
      if (d.type === "notebook") return 280 + d.weight * 1.5;
      if (d.type === "content") return 400 + d.weight * 1.5;
      if (d.type === "tag") return 550 + d.weight * 1.5;
      return 300;
    }, center.x, center.y).strength(0.2))
    .alphaDecay(0.02)
    .on("tick", ticked);

  const link = zoomGroup.append("g")
    .attr("stroke", "#aaa")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 1.5);

  const node = zoomGroup.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .on("mouseover", (event, d) => {
      tooltip.text(`
        ${d.name} [${parseType(d.type)}]
        `).style("visibility", "visible");
    })
    .on("mousemove", (event) => {
      tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    })
    .on("click", clickNode)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    );

  node.append("circle")
    .attr("r", d => 7 + Math.log2(d.weight + 1) * 3)
    .attr("fill", d => d.type === "tag" ? d.color : "#fff")
    .attr("stroke", d => d.color || "#999")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", d => d.type === "content" ? "4,2" : null);

  node.filter(d => d.type !== "tag")
    .append("foreignObject")
    .attr("width", 20)
    .attr("height", 20)
    .attr("x", -10)
    .attr("y", -10)
    .html(d => {
      const icon = d.icon || "question-circle";
      return `<div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;">
                <i class="bi bi-${icon}" style="font-size:14px;"></i>
              </div>`;
    });

  const labels = node.append("text")
    .text(d => d.name)
    .attr("dy", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "9px")
    .attr("fill", "#333");

  

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  let labelsVisible = true;
  const actions = {
    zoomIn: () => svg.transition().call(zoomBehavior.scaleBy, 1.2),
    zoomOut: () => svg.transition().call(zoomBehavior.scaleBy, 0.8),
    reset: () => svg.transition().call(zoomBehavior.transform, d3.zoomIdentity),
    toggleLabel: () => {
      labelsVisible = !labelsVisible;
      labels.style("display", labelsVisible ? null : "none");
    }
  }

  return [svg.node(), actions]
}


