'''
Business: API для работы с группами (получение списка, добавление, поиск)
Args: event с httpMethod, queryStringParameters, body; context с request_id
Returns: HTTP response с данными групп
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    
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
        if method == 'GET' and params.get('stats') == 'true':
            cur.execute("""
                SELECT 
                    g.id,
                    g.name,
                    g.platform,
                    g.avatar,
                    g.members,
                    COALESCE(AVG(r.rating), 0) as avg_rating,
                    COUNT(r.id) as reviews_count,
                    COUNT(CASE WHEN r.rating = 5 THEN 1 END) as rating_5_count,
                    COUNT(CASE WHEN r.rating = 4 THEN 1 END) as rating_4_count,
                    COUNT(CASE WHEN r.rating = 3 THEN 1 END) as rating_3_count,
                    COUNT(CASE WHEN r.rating = 2 THEN 1 END) as rating_2_count,
                    COUNT(CASE WHEN r.rating = 1 THEN 1 END) as rating_1_count,
                    g.created_at
                FROM groups g
                LEFT JOIN reviews r ON g.id = r.group_id
                GROUP BY g.id, g.name, g.platform, g.avatar, g.members, g.created_at
                ORDER BY reviews_count DESC, avg_rating DESC
            """)
            
            stats = []
            for row in cur.fetchall():
                stats.append({
                    'id': row['id'],
                    'name': row['name'],
                    'platform': row['platform'],
                    'avatar': row['avatar'],
                    'members_count': row['members'],
                    'avg_rating': round(float(row['avg_rating']), 1),
                    'reviews_count': row['reviews_count'],
                    'rating_distribution': {
                        '5': row['rating_5_count'],
                        '4': row['rating_4_count'],
                        '3': row['rating_3_count'],
                        '2': row['rating_2_count'],
                        '1': row['rating_1_count']
                    },
                    'created_at': str(row['created_at'])
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'stats': stats}),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            search = params.get('search', '')
            platform = params.get('platform', '')
            sort_by = params.get('sort', 'created_at')
            
            query = '''
                SELECT 
                    g.id, g.name, g.platform, g.members, g.description, 
                    g.link, g.avatar, g.created_at,
                    COALESCE(AVG(r.rating), 0) as rating,
                    COUNT(r.id) as reviews_count
                FROM groups g
                LEFT JOIN reviews r ON g.id = r.group_id
                WHERE 1=1
            '''
            
            if search:
                query += f" AND LOWER(g.name) LIKE LOWER('%{search}%')"
            
            if platform:
                query += f" AND g.platform = '{platform}'"
            
            query += ' GROUP BY g.id'
            
            if sort_by == 'rating':
                query += ' ORDER BY rating DESC'
            elif sort_by == 'reviews':
                query += ' ORDER BY reviews_count DESC'
            else:
                query += ' ORDER BY g.created_at DESC'
            
            cur.execute(query)
            groups = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(g) for g in groups], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            name = body.get('name', '')
            platform = body.get('platform', '')
            members = body.get('members', '')
            description = body.get('description', '')
            link = body.get('link', '')
            avatar = body.get('avatar', '')
            
            if not name or not platform:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Name and platform are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                '''INSERT INTO groups (name, platform, members, description, link, avatar) 
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING id''',
                (name, platform, members, description, link, avatar)
            )
            group_id = cur.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': group_id, 'message': 'Group created successfully'}),
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