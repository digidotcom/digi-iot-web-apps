import { DefaultUser } from 'next-auth';

declare module 'next-auth' {
    export interface User extends DefaultUser {
        apiAuth: string;
        username: string;
        email: string;
        customerId: number;
        role: string;
        roleReadOnly: string;
        roleAdmin: string;
        roleWebUi: string;
        firstName: string;
        lastName: string;
        companyName: string;
    }
}

/**
 * Interface representing a user info in the /UserInfo API.
 */
export interface IUserInfo {
    cstId: string;
    roleReadOnly: string;
    roleAdmin: string;
    roleWebUi: string;
    usrFirstName: string;
    usrLastName: string;
    cstCompanyName: string;
    role: string;
    usrEmail: string;
    usrUserName: string;
}
