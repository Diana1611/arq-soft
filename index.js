const express = require('express');
const app = express();

app.use(express.json());

// Simulación de base de datos
let cuentas = {
    "1": { saldo: 1000 }
};

// Cache de requestId (idempotencia)
let requestCache = new Map();


// SIN CONTROL (PROBLEMA)
app.post('/transferir-sin-control', (req, res) => {
    const { cuentaId, monto } = req.body;

    let cuenta = cuentas[cuentaId];

    if (!cuenta) {
        return res.status(404).json({ mensaje: "Cuenta no encontrada" });
    }

    setTimeout(() => {
        cuenta.saldo -= monto;

        console.log("❌ SIN CONTROL");

        res.json({
            status: "ok",
            saldo: cuenta.saldo
        });
    }, 100);
});


// CON CONTROL (SOLUCIÓN)
app.post('/transferir-con-control', (req, res) => {
    const { cuentaId, monto, requestId } = req.body;

    if (!requestId) {
        return res.status(400).json({ mensaje: "Falta requestId" });
    }

    let cuenta = cuentas[cuentaId];

    if (!cuenta) {
        return res.status(404).json({ mensaje: "Cuenta no encontrada" });
    }

    // Verificamos los duplicados
    if (requestCache.has(requestId)) {
        console.log("♻️ DUPLICADO");

        return res.json({
            mensaje: "Solicitud ya procesada",
            resultado: requestCache.get(requestId)
        });
    }

    setTimeout(() => {
        cuenta.saldo -= monto;

        const resultado = {
            status: "ok",
            saldo: cuenta.saldo
        };

        requestCache.set(requestId, resultado);

        console.log("✅ CON CONTROL");

        res.json(resultado);
    }, 100);
});


// vemos el saldo
app.get('/saldo/:cuentaId', (req, res) => {
    const cuenta = cuentas[req.params.cuentaId];

    res.json(cuenta);
});


app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});