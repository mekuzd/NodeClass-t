const Error404 = async (req, res) => {
  await res.status(404).send("route not available");
};
module.exports = Error404;
