import json

def lambda_handler(event, context):
    try:
        operation = event.get('operation')
        a = event.get('a')
        b = event.get('b')

        if a is None or b is None or operation is None:
            return {
                'statusCode': 400,
                'result': 'Missing parameters'
            }

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
                return {
                    'statusCode': 400,
                    'result': 'Division by zero'
                }
            result = a / b
        else:
            return {
                'statusCode': 400,
                'result': f'Unknown operation: {operation}'
            }

        return {
            'statusCode': 200,
            'result': result
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'result': str(e)
        }
