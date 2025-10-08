'''
Business: API для работы с отзывами (получение, добавление)
Args: event с httpMethod, queryStringParameters, body; context с request_id
Returns: HTTP response с данными отзывов
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            group_id = params.get('group_id', '')
            
            if group_id:
                query = '''
                    SELECT r.*, g.name as group_name
                    FROM reviews r
                    JOIN groups g ON r.group_id = g.id
                    WHERE r.group_id = %s
                    ORDER BY r.created_at DESC
                '''
                cur.execute(query, (group_id,))
            else:
                query = '''
                    SELECT r.*, g.name as group_name
                    FROM reviews r
                    JOIN groups g ON r.group_id = g.id
                    ORDER BY r.created_at DESC
                    LIMIT 50
                '''
                cur.execute(query)
            
            reviews = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(r) for r in reviews], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            group_id = body.get('group_id')
            user_name = body.get('user_name', '')
            user_avatar = body.get('user_avatar', '')
            rating = body.get('rating', 0)
            text = body.get('text', '')
            
            if not group_id or not user_name or not rating or not text:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'group_id, user_name, rating and text are required'}),
                    'isBase64Encoded': False
                }
            
            if rating < 1 or rating > 5:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Rating must be between 1 and 5'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                '''INSERT INTO reviews (group_id, user_name, user_avatar, rating, text) 
                   VALUES (%s, %s, %s, %s, %s) RETURNING id''',
                (group_id, user_name, user_avatar, rating, text)
            )
            review_id = cur.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': review_id, 'message': 'Review created successfully'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
