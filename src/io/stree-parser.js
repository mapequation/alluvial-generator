function matchCodelength(string) {
  const match = string.match(
    /^#\s?codelength.*?([0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)/i
  );
  return match ? +match[1] : null;
}

function matchStree(line) {
  // path flow name [id [physicalId]]
  return line.match(
    /(\d+(?:[:;]\d+)+[:;]) ([0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?) "(.+)"(?: (\d+)(?: (\d+))?)?/
  );
}

export default function streeParser(lines) {
  const result = {
    codelength: null,
    nodes: [],
  };

  lines.forEach((line) => {
    if (!result.codelength) {
      result.codelength = matchCodelength(line);
    }
    const match = matchStree(line);
    if (match) {
      const [_, path, flow, name, id, physId] = match; // eslint-disable-line no-unused-vars
      result.nodes.push({
        path,
        flow: +flow,
        name,
        id: physId ? +physId : +id,
        stateId: physId ? +id : null,
      });
    }
  });

  return result;
}
