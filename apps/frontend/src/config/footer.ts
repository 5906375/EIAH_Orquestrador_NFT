export type SocialLinks = {
    instagram?: string;
    x?: string;
    linkedin?: string;
    youtube?: string;
    site?: string;
};

export type QuickLinks = {
    termos?: string;
    privacidade?: string;
    cancelamento?: string;
    kyc?: string;
    planos?: string;
    suporte?: string;
};

export type FooterConfig = {
    companyName: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    social?: SocialLinks;
    links?: QuickLinks;
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
    companyName: "NFTDiárias",
    email: "contato@nftdiarias.com",
    phone: "",
    whatsapp: "",
    address: "",
    social: {
        instagram: "",
        x: "",
        linkedin: "",
        youtube: "",
        site: "",
    },
    links: {
        termos: "/termos",
        privacidade: "/privacidade",
        cancelamento: "/cancelamento",
        kyc: "/kyc",
        planos: "/planos",
        suporte: "/painel-usuario",
    },
};

export const FOOTER_CFG_KEY = "nftdiarias_footer_config_v1";
