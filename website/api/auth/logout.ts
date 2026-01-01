import { serialize as serializeCookie } from 'cookie';
import { deleteSession } from '../sessionStore';

export const handler = async (event: any) => {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie || '';
  const match = cookieHeader.match(/session=([^;]+)/);
  if (match) {
    const [sessionId] = match[1].split('.');
    await deleteSession(sessionId);
  }
  const cookie = serializeCookie('session', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  });
  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': cookie,
      'Access-Control-Allow-Origin':
        process.env.SITE_HOST || 'https://name-draw.com',
      'Access-Control-Allow-Credentials': true,
    },
    body: '',
  };
};
