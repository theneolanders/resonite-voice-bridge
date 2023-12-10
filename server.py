from flask import Flask, render_template
import asyncio
import websockets
import threading

app = Flask(__name__)

connected_clients = set()

async def echo(websocket):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            tasks = [asyncio.create_task(client.send(message)) for client in connected_clients if client != websocket]

            # Only call asyncio.wait if there are active connections
            if tasks:
                await asyncio.wait(tasks)
    finally:
        connected_clients.remove(websocket)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    flask_thread = threading.Thread(target=lambda: app.run(port=5000, use_reloader=False))
    flask_thread.start()

    websocket_server = websockets.serve(echo, "localhost", 6789)

    asyncio.get_event_loop().run_until_complete(websocket_server)
    asyncio.get_event_loop().run_forever()
