module.exports = {
  apps: [
    {
      name: "erp-repair-backend",
      // Ejecutar la versión compilada en JS asumiendo que ya se corrió "npm run build"
      script: "./dist/server.js",

      // Observar cambios (opcional, en producción suele ser false)
      watch: false,

      // Manejo de entorno
      env: {
        NODE_ENV: "production",
        // El resto de tus variables (como DATABASE_URL)
        // deberían estar en tu archivo .env local
      },

      // Reinicios automáticos en caso de crasheos de memoria o bugs
      autorestart: true,
      max_memory_restart: "1G",

      // Archivos de Logs
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
