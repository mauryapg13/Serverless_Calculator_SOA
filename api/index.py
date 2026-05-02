import json

def app(environ, start_response):
    if environ['REQUEST_METHOD'] == 'OPTIONS':
        start_response('200 OK', [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'POST, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type'),
        ])
        return [b'']
        
    if environ['REQUEST_METHOD'] == 'POST':
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
            post_data = environ['wsgi.input'].read(content_length)
            event = json.loads(post_data.decode('utf-8'))
            
            operation = event.get('operation')
            a = event.get('a')
            b = event.get('b')

            if a is None or b is None or operation is None:
                start_response('400 Bad Request', [('Content-Type', 'application/json')])
                return [json.dumps({'statusCode': 400, 'result': 'Missing parameters'}).encode('utf-8')]

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
                    start_response('400 Bad Request', [('Content-Type', 'application/json')])
                    return [json.dumps({'statusCode': 400, 'result': 'Division by zero'}).encode('utf-8')]
                result = a / b
            else:
                start_response('400 Bad Request', [('Content-Type', 'application/json')])
                return [json.dumps({'statusCode': 400, 'result': f'Unknown operation: {operation}'}).encode('utf-8')]

            start_response('200 OK', [('Content-Type', 'application/json')])
            return [json.dumps({'statusCode': 200, 'result': result}).encode('utf-8')]
            
        except Exception as e:
            start_response('500 Internal Server Error', [('Content-Type', 'application/json')])
            return [json.dumps({'statusCode': 500, 'result': str(e)}).encode('utf-8')]
            
    start_response('405 Method Not Allowed', [('Content-Type', 'text/plain')])
    return [b'Method not allowed']
