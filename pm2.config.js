module.exports = {
  apps: [
    {
      name: "server",
      script: "node",
      args: "-r module-alias/register ./dist/app.js",
    },
  ],
};
