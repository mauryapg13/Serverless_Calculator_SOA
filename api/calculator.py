import json
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            event = json.loads(post_data.decode('utf-8'))
            
            operation = event.get('operation')
            a = event.get('a')
            b = event.get('b')

            if a is None or b is None or operation is None:
                self._send_response(400, {'statusCode': 400, 'result': 'Missing parameters'})
                return

            a = float(a)
            b = float(b)

            if operation == 'add':
                result = a + b
            elif operation == 'subtract':
                result = a - b
            elif operation == 'multiply':
                result = a * b
            elif operation == 'divide':
                if b == 0:
                    self._send_response(400, {'statusCode': 400, 'result': 'Division by zero'})
                    return
                result = a / b
            else:
                self._send_response(400, {'statusCode': 400, 'result': f'Unknown operation: {operation}'})
                return

            self._send_response(200, {'statusCode': 200, 'result': result})

        except Exception as e:
            self._send_response(500, {'statusCode': 500, 'result': str(e)})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _send_response(self, status_code, body_dict):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(body_dict).encode('utf-8'))
