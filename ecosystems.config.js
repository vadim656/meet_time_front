module.exports = {
    apps: [
      {
        name: 'meet',
        script: 'yarn',
        args: 'start',
        port: 1337,
        env: {
          NODE_ENV: 'production',
        },
        exp_backoff_restart_delay: 100,
      },
    ],
  };