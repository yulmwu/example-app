const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const HOST = process.env.HOST || '127.0.0.1'
const PORT = process.env.PORT || 3000
const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX || ''

app.get(`${GLOBAL_PREFIX}/`, (req, res) => {
    res.send(`Hello from ${process.env.APP_NAME || '(unset)'}`)
})

app.get(`${GLOBAL_PREFIX}/health`, (_, res) => res.send('ok'))

app.get(`${GLOBAL_PREFIX}/info`, (req, res) => {
    res.type('text/plain')
    res.send(`App Name: ${process.env.APP_NAME || '(unset)'}
Host: ${HOST}
Port: ${PORT}
Global Prefix: ${GLOBAL_PREFIX}
Node Version: ${process.version}
Platform: ${process.platform} ${process.arch}
Memory Usage: ${JSON.stringify(process.memoryUsage())}
Uptime: ${process.uptime()} seconds
`)
})

app.get(`${GLOBAL_PREFIX}/metrics`, (req, res) => {
    res.json({ mem: process.memoryUsage(), cpu: process.cpuUsage() })
})

app.get(`${GLOBAL_PREFIX}/cpu_load`, (req, res) => {
    const load = parseInt(req.query.load) || 1
    const duration = parseInt(req.query.duration) || 5
    const end = Date.now() + duration * 1000

    while (Date.now() < end) {
        for (let i = 0; i < load * 1e7; i++) {
            Math.sqrt(i)
        }
    }

    res.send(`Simulated CPU load of ${load} for ${duration} seconds`)
})

app.get(`${GLOBAL_PREFIX}/mem_load`, (req, res) => {
    const size = parseInt(req.query.size) || 100
    const duration = parseInt(req.query.duration) || 10
    const memoryHog = []

    for (let i = 0; i < size * 1e6; i++) {
        memoryHog.push(new Array(1000).fill('*'))
    }

    setTimeout(() => {
        res.send(`Simulated memory load of ${size}MB for ${duration} seconds`)
    }, duration * 1000)
})

app.get(`${GLOBAL_PREFIX}/crash`, () => {
    console.log('Simulating crash...')
    process.exit(1)
})

app.get(`${GLOBAL_PREFIX}/env`, (req, res) => {
    const keys = (req.query.select || '')
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k)
    const env = {}

    if (keys.length > 0) {
        keys.forEach((key) => {
            env[key] = process.env[key] || null
        })
    } else {
        Object.keys(process.env).forEach((key) => {
            env[key] = process.env[key]
        })
    }

    res.json(env)
})

app.get(`${GLOBAL_PREFIX}/headers`, (req, res) => {
    res.json(req.headers)
})

app.get(`${GLOBAL_PREFIX}/ip`, (req, res) => {
    res.send(req.ip)
})

app.get(`${GLOBAL_PREFIX}/delay`, (req, res) => {
    const duration = parseInt(req.query.duration) || 5
    setTimeout(() => {
        res.send(`Response delayed by ${duration} seconds`)
    }, duration * 1000)
})

app.post(`${GLOBAL_PREFIX}/shell`, (req, res) => {
    const { exec } = require('child_process')
    const cmd = req.body?.cmd || 'echo "No command provided"'
    const shell = req.body?.shell || '/bin/sh'

    exec(cmd, { shell }, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send({ stdout, stderr, error: error.message })
            return
        }
        if (stderr) {
            res.status(500).send({ stdout, stderr, error: 'Command failed' })
            return
        }
        res.send({ stdout })
    })
})

app.get(`${GLOBAL_PREFIX}/terminal`, (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Terminal</title>
    <style>
        body { font-family: monospace; background: #000; color: rgba(255, 255, 255, 1); padding: 20px; }
        #output { height: 400px; overflow-y: scroll; border: 1px solid rgba(255, 255, 255, 1); padding: 10px; margin-bottom: 10px; }
        #input { width: 100%; padding: 10px; border: 1px solid rgba(255, 255, 255, 1); background: #000; color: rgba(255, 255, 255, 1); }
    </style>
</head>
<body>
    <div id="output"></div>
    <input type="text" id="input" placeholder="Type a command and press Enter" autofocus />
    <select id="shell">
        <option value="/bin/bash">/bin/bash</option>
        <option value="/bin/sh">/bin/sh</option>
        <option value="/bin/zsh">/bin/zsh</option>
    </select>
    <script>
        const output = document.getElementById('output');
        const input = document.getElementById('input');
        const shell = document.getElementById('shell');

        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const command = input.value;
                output.innerHTML += \`<div>$ \${command}</div>\`;
                input.value = '';

                fetch('${GLOBAL_PREFIX}/shell', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cmd: command, shell: shell.value })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        output.innerHTML += \`<div style="color: red;">Error: \${data.error}</div>\`;
                    }
                    if (data.stdout) {
                        output.innerHTML += \`<div>\${data.stdout.replace(/\\n/g, '<br>')}</div>\`;
                    }
                    if (data.stderr) {
                        output.innerHTML += \`<div style="color: orange;">\${data.stderr.replace(/\\n/g, '<br>')}</div>\`;
                    }
                    output.scrollTop = output.scrollHeight;
                })
                .catch(err => {
                    output.innerHTML += \`<div style="color: red;">Fetch error: \${err.message}</div>\`;
                    output.scrollTop = output.scrollHeight;
                });
            }
        });
    </script>
</body>
</html>
    `)
})

app.listen(PORT, HOST, () => {
    console.log(`[startup] listening on ${HOST}:${PORT}, APP_NAME=${process.env.APP_NAME || '(unset)'}`)
})
