export declare const appConfig: () => {
    port: number;
    environment: string;
    database: {
        url: string | undefined;
    };
    auth0: {
        domain: string | undefined;
        audience: string | undefined;
        clientId: string;
        clientSecret: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
};
export type AppConfig = ReturnType<typeof appConfig>;
