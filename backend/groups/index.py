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
import requests

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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        
        if method == 'GET' and params.get('analytics'):
            group_id = params.get('analytics')
            cur.execute(
                "SELECT platform, vk_group_id, telegram_channel_id FROM groups WHERE id = %s",
                (group_id,)
            )
            group_data = cur.fetchone()
            
            if not group_data:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Group not found'}),
                    'isBase64Encoded': False
                }
            
            platform = group_data['platform']
            analytics = {}
            
            if platform == 'vk' and group_data['vk_group_id']:
                analytics = get_vk_analytics(group_data['vk_group_id'])
            elif platform == 'telegram' and group_data['telegram_channel_id']:
                analytics = get_telegram_analytics(group_data['telegram_channel_id'])
            else:
                analytics = {
                    'available': False,
                    'message': 'Статистика недоступна - не указан ID группы'
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(analytics),
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
            
            if body.get('groupId'):
                group_id = body.get('groupId')
                name = body.get('name')
                platform = body.get('platform')
                avatar = body.get('avatar')
                members = body.get('members')
                description = body.get('description', '')
                link = body.get('link', '')
                vk_group_id = body.get('vk_group_id', '')
                telegram_channel_id = body.get('telegram_channel_id', '')
                
                cur.execute(
                    '''UPDATE groups 
                       SET name = %s, platform = %s, avatar = %s, members = %s, 
                           description = %s, link = %s, vk_group_id = %s, 
                           telegram_channel_id = %s, updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s''',
                    (name, platform, avatar, members, description, link,
                     vk_group_id if vk_group_id else None,
                     telegram_channel_id if telegram_channel_id else None,
                     group_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Group updated successfully'}),
                    'isBase64Encoded': False
                }
            else:
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

def get_vk_analytics(group_id: str) -> Dict[str, Any]:
    vk_token = os.environ.get('VK_API_TOKEN')
    
    if not vk_token:
        return {
            'available': False,
            'message': 'VK API токен не настроен'
        }
    
    try:
        response = requests.get(
            'https://api.vk.com/method/groups.getById',
            params={
                'group_id': group_id,
                'fields': 'members_count,activity,description',
                'access_token': vk_token,
                'v': '5.131'
            },
            timeout=10
        )
        
        data = response.json()
        
        if 'error' in data:
            return {
                'available': False,
                'message': f"Ошибка VK API: {data['error'].get('error_msg', 'Unknown')}"
            }
        
        if 'response' not in data or not data['response']:
            return {
                'available': False,
                'message': 'Группа не найдена в VK'
            }
        
        group_info = data['response'][0]
        
        wall_response = requests.get(
            'https://api.vk.com/method/wall.get',
            params={
                'owner_id': f"-{group_info['id']}",
                'count': 10,
                'access_token': vk_token,
                'v': '5.131'
            },
            timeout=10
        )
        
        wall_data = wall_response.json()
        posts = wall_data.get('response', {}).get('items', [])
        
        total_likes = sum(post.get('likes', {}).get('count', 0) for post in posts)
        total_comments = sum(post.get('comments', {}).get('count', 0) for post in posts)
        total_reposts = sum(post.get('reposts', {}).get('count', 0) for post in posts)
        total_views = sum(post.get('views', {}).get('count', 0) for post in posts)
        
        avg_engagement = 0
        if posts and group_info.get('members_count', 0) > 0:
            total_engagement = total_likes + total_comments + total_reposts
            avg_engagement = (total_engagement / len(posts) / group_info['members_count']) * 100
        
        return {
            'available': True,
            'platform': 'vk',
            'subscribers': group_info.get('members_count', 0),
            'posts_count': wall_data.get('response', {}).get('count', 0),
            'recent_posts': len(posts),
            'avg_likes': total_likes // len(posts) if posts else 0,
            'avg_comments': total_comments // len(posts) if posts else 0,
            'avg_reposts': total_reposts // len(posts) if posts else 0,
            'avg_views': total_views // len(posts) if posts else 0,
            'engagement_rate': round(avg_engagement, 2),
            'total_reactions': total_likes + total_comments + total_reposts
        }
        
    except Exception as e:
        return {
            'available': False,
            'message': f'Ошибка: {str(e)}'
        }

def get_telegram_analytics(channel_id: str) -> Dict[str, Any]:
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        return {
            'available': False,
            'message': 'Telegram Bot токен не настроен'
        }
    
    try:
        if not channel_id.startswith('@'):
            channel_id = f'@{channel_id}'
        
        response = requests.get(
            f'https://api.telegram.org/bot{bot_token}/getChat',
            params={'chat_id': channel_id},
            timeout=10
        )
        
        data = response.json()
        
        if not data.get('ok'):
            return {
                'available': False,
                'message': f"Ошибка Telegram API: {data.get('description', 'Unknown')}"
            }
        
        chat_info = data['result']
        
        return {
            'available': True,
            'platform': 'telegram',
            'subscribers': chat_info.get('member_count', 0),
            'title': chat_info.get('title', ''),
            'description': chat_info.get('description', ''),
            'username': chat_info.get('username', ''),
            'type': chat_info.get('type', ''),
            'message': 'Полная статистика доступна только администраторам'
        }
        
    except Exception as e:
        return {
            'available': False,
            'message': f'Ошибка: {str(e)}'
        }