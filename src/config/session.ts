export interface Session {
    data: SessionData,
    destroy: Function
}

export interface SessionData {
    admin?: SessionAdmin | any
    guest?: SessionGuest | any
}

export interface SessionAdmin {
    id: number,
    name: string,
    surname: string,
    type_name: string,
    type: number,
    email: string,
    image: string,
    ip: string,
    token: string,
    lang: string
    permission: Array<number>
}

export interface SessionGuest {
    ip: string,
    token: string,
    lang: string
}

export class Session{
    constructor(session: any, values: SessionData) {
        session.data = values;

        session.save();
    }
}

export default Session;