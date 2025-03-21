const JSONRPC = {
  id: "1",
  jsonrpc: "2.0",
};

function methods(method, params, id) {
  return JSON.stringify(
    Object.assign({}, JSONRPC, {
      method,
      params,
      id,
    })
  );
}

module.exports = methods;
