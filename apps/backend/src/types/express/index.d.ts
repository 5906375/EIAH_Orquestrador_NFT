declare global {
    namespace Express {
        interface UserWallet {
            wallet: string;
            [k: string]: any;
        }
        interface Request {
            user?: UserWallet;
        }
    }
}
export { };
