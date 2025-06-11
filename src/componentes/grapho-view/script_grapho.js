let materias = [];

window.onload = function () {
  const dadosSalvos = localStorage.getItem("materias");
  if (dadosSalvos) {
    materias = JSON.parse(dadosSalvos);
    materias.forEach((m, index) => adicionarNaTabela(m.materia, m.nota, index));
    atualizarMedia();
    atualizarGrafico();
  }
};

function adicionarMateria() {
  const materia = document.getElementById("materia").value.trim();
  const nota = parseFloat(document.getElementById("nota").value);

  if (materia === "" || isNaN(nota)) {
    alert("Por favor, preencha todos os campos corretamente.");
    return;
  }

  materias.push({ materia, nota });
  salvarNoLocalStorage();
  adicionarNaTabela(materia, nota, materias.length - 1);
  atualizarMedia();
  atualizarGrafico();

  document.getElementById("materia").value = "";
  document.getElementById("nota").value = "";
}

function adicionarNaTabela(materia, nota, index) {
  const tabela = document
    .getElementById("tabelaMaterias")
    .getElementsByTagName("tbody")[0];
  const novaLinha = tabela.insertRow();
  novaLinha.setAttribute("data-index", index);

  novaLinha.innerHTML = `
    <td>${materia}</td>
    <td>${nota.toFixed(1)}</td>
    <td>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-warning" onclick="editarMateria(${index})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="removerMateria(${index})">Remover</button>
      </div>
    </td>
  `;
}

function editarMateria(index) {
  const novaMateria = prompt("Novo nome da matéria:", materias[index].materia);
  const novaNota = parseFloat(prompt("Nova nota:", materias[index].nota));

  if (novaMateria && !isNaN(novaNota)) {
    materias[index] = { materia: novaMateria.trim(), nota: novaNota };
    salvarNoLocalStorage();
    atualizarTabela();
    atualizarMedia();
    atualizarGrafico();
  }
}

function removerMateria(index) {
  if (confirm("Tem certeza que deseja remover essa matéria?")) {
    materias.splice(index, 1);
    salvarNoLocalStorage();
    atualizarTabela();
    atualizarMedia();
    atualizarGrafico();
  }
}

function limparTudo() {
  if (confirm("Deseja apagar tudo?")) {
    materias = [];
    salvarNoLocalStorage();
    atualizarTabela();
    atualizarMedia();
    atualizarGrafico();
  }
}

function atualizarTabela() {
  const corpoTabela = document
    .getElementById("tabelaMaterias")
    .getElementsByTagName("tbody")[0];
  corpoTabela.innerHTML = "";
  materias.forEach((m, index) => adicionarNaTabela(m.materia, m.nota, index));
}

function atualizarMedia() {
  if (materias.length === 0) {
    document.getElementById("mediaGeral").innerText = "0.0";
    return;
  }
  const soma = materias.reduce((acc, m) => acc + m.nota, 0);
  const media = soma / materias.length;
  document.getElementById("mediaGeral").innerText = media.toFixed(2);
}

function salvarNoLocalStorage() {
  localStorage.setItem("materias", JSON.stringify(materias));
}

function calcularMediaGeral() {
  const todasNotas = materias.map((m) => m.nota);
  const soma = todasNotas.reduce((acc, val) => acc + val, 0);
  return todasNotas.length ? soma / todasNotas.length : 0;
}

  const nodes = [];
  const links = [];
function atualizarGrafico() {
  const container = document.getElementById("graphContainer");
  container.innerHTML = "";

  const width = 800;
  const height = 600;

  const color = d3.scaleOrdinal(d3.schemeCategory10);


  // Agrupar notas por matéria
  const materiasMap = {};
  materias.forEach(({ materia, nota }) => {
    if (!materiasMap[materia]) {
      materiasMap[materia] = [];
    }
    materiasMap[materia].push(nota);
  });

  // Nó central
  nodes.push({ id: "Média Geral", type: "mediaGeral" });

  for (const [materia, notas] of Object.entries(materiasMap)) {
    const mediaMateria = notas.reduce((sum, n) => sum + n, 0) / notas.length;

    nodes.push({ id: materia, type: "materia", media: mediaMateria });
    links.push({ source: "Média Geral", target: materia });

    notas.forEach((nota, index) => {
      const notaId = `${materia} - Nota ${index + 1}`;
      nodes.push({ id: notaId, type: "nota", nota: nota });
      links.push({ source: materia, target: notaId });
    });
  }

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(60)
    )
    .force("charge", d3.forceManyBody().strength(-150))
    .force("center", d3.forceCenter(0, 0))
    .force(
      "collision",
      d3.forceCollide().radius((d) => (d.type === "mediaGeral" ? 30 : 20))
    )
    .on("tick", ticked);

  const link = svg
    .append("g")
    .attr("stroke", "#aaa")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 1.5);

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) =>
      d.type === "mediaGeral" ? 20 : d.type === "materia" ? 15 : 8
    )
    .attr("fill", (d) => {
      if (d.type === "mediaGeral") return "#444";
      if (d.type === "materia") return "#1f77b4";
      return "#ff7f0e";
    })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  node.append("title").text((d) => {
    if (d.type === "mediaGeral")
      return `Média Geral: ${calcularMediaGeral().toFixed(2)}`;
    if (d.type === "materia")
      return `Matéria: ${d.id}\nMédia: ${d.media.toFixed(2)}`;
    if (d.type === "nota") return `Nota: ${d.nota}`;
    return d.id;
  });

  const label = svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text("")
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .attr("dy", -15)
    .attr("fill", "#333")
    .style("pointer-events", "none");

  // Hover para mostrar nome da matéria temporariamente
  node.on("mouseover", function (event, d) {
    if (d.type === "materia") {
      label.filter((l) => l.id === d.id).text(d.id);
    }
  });

  node.on("mouseout", function (event, d) {
    if (d.type === "materia") {
      label.filter((l) => l.id === d.id).text("");
    }
  });

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    label.attr("x", (d) => d.x).attr("y", (d) => d.y);
  }

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

  container.appendChild(svg.node());
}
