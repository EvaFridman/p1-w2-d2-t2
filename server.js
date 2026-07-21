const http = require('http');
const url = require('url');

const initial = [
    { id: 1, name: 'Аня Петрова', role: 'frontend' },
    { id: 2, name: 'Борис Ким', role: 'backend' },
    { id: 3, name: 'Вера Соколова', role: 'design' },
];

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
    console.log(req.method, req.url);

    const parsedUrl = url.parse(req.url, true);
    const matchId = parsedUrl.pathname.match(/^\/users\/(\d+)$/);

    if (parsedUrl.pathname === '/users') {
        if (req.method === 'GET') {
            return sendJson(res, 200, initial);
        }

        if (req.method === 'POST') {
            try {
                const rawBody = await readBody(req);
                const newUser = JSON.parse(rawBody);

                const maxId = initial.reduce((max, u) => Math.max(max, u.id), 0);
                const createdUser = { id: maxId + 1, ...newUser };
                initial.push(createdUser);

                return sendJson(res, 201, createdUser);
            } catch (error) {
                return sendJson(res, 400, { error: 'Некорректное тело запроса' });
            }
        }

        return sendJson(res, 405, { error: 'Метод не поддерживается' });
    }

    if (matchId) {
        if (req.method === 'GET') {
            const userId = parseInt(matchId[1], 10);
            const user = initial.find((u) => u.id === userId);

            if (!user) {
                return sendJson(res, 404, { error: 'Пользователь не найден' });
            }

            return sendJson(res, 200, user);
        }

        return sendJson(res, 405, { error: 'Метод не поддерживается' });
    }

    return sendJson(res, 404, { error: 'Not found' });
});

server.listen(3000, () => console.log('http://localhost:3000'));