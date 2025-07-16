import { JwtPayload } from 'jsonwebtoken';

export interface DecodedToken {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}

export class JwtDecoderUtil {

    static decodeToken(token: string): DecodedToken {
        try {

            const cleanToken = token.replace(/^Bearer\s+/, '');

            const parts = cleanToken.split('.');

            if (parts.length !== 3) {
                throw new Error('Token JWT inválido: deve ter 3 partes');
            }


            const payload = parts[1];


            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

            const decodedString = Buffer.from(paddedPayload, 'base64').toString('utf-8');

            const decodedPayload = JSON.parse(decodedString) as DecodedToken;

            return decodedPayload;
        } catch (error) {
            throw new Error(`Erro ao decodificar token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }


    static isTokenValid(token: string): boolean {
        try {
            const decoded = this.decodeToken(token);
            const currentTime = Math.floor(Date.now() / 1000);

            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    }

    static getUserIdFromToken(token: string): string {
        const decoded = this.decodeToken(token);
        return decoded.sub;
    }


    static getEmailFromToken(token: string): string {
        const decoded = this.decodeToken(token);
        return decoded.email;
    }
} 